sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/BusyDialog",
    "sap/m/TableSelectDialog",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ColumnListItem"
], function (
    Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox, MessageToast, BusyDialog,
    TableSelectDialog, Column, Text, ColumnListItem
) {
    "use strict";

    return Controller.extend("node.t2.quotationmanagement.controller.Main", {
        onInit: function () {
            var oViewModel = new JSONModel({
                selected: {},
                items: [],
                createItems: [],
                createQuotDocTy: "S",
                createTotalAmount: 0,
                createCurrency: "KRW"
            });

            this.getView().setModel(oViewModel, "view");

            this._oBusyDialog = new BusyDialog({
                title: "처리 중",
                text: "잠시만 기다려주세요."
            });
        },
       onSearch: function () {
            var aFilters = [];

            var sDocDateFrom = this.byId("dpDocDateFrom").getValue();
            var sDocDateTo = this.byId("dpDocDateTo").getValue();
            var sQuotDocTy = this.byId("selQuotDocTy").getSelectedKey();
            var sSoldTo = this.byId("sfSoldTo").getValue();
            var sQuotStatus = this.byId("selQuotStatus").getSelectedKey();

            var oDocDateFrom = null;
            var oDocDateTo = null;

            if (sDocDateFrom) {
                oDocDateFrom = new Date(sDocDateFrom + "T12:00:00");
            }

            if (sDocDateTo) {
                oDocDateTo = new Date(sDocDateTo + "T12:00:00");
            }

            if (oDocDateFrom && oDocDateTo) {
                aFilters.push(new Filter("DocDate", FilterOperator.BT, oDocDateFrom, oDocDateTo));
            } else if (oDocDateFrom) {
                aFilters.push(new Filter("DocDate", FilterOperator.GE, oDocDateFrom));
            } else if (oDocDateTo) {
                aFilters.push(new Filter("DocDate", FilterOperator.LE, oDocDateTo));
            }

            if (sQuotDocTy) {
                aFilters.push(new Filter("QuotDocTy", FilterOperator.EQ, sQuotDocTy));
            }

            // 우선 고객코드 기준으로만 조회
            if (sSoldTo) {
                aFilters.push(new Filter("SoldTo", FilterOperator.EQ, sSoldTo));
            }

            if (sQuotStatus) {
                aFilters.push(new Filter("QuotStatus", FilterOperator.EQ, sQuotStatus));
            }

            var oBinding = this.byId("quotationTable").getBinding("items");

            if (oBinding) {
                // 견적번호 기준 내림차순 정렬
                oBinding.sort(new Sorter("QuotCd", true));

                // 조회조건 적용
                oBinding.filter(aFilters);
            }
        },

        onClearFilter: function () {
            this.byId("dpDocDateFrom").setValue("");
            this.byId("dpDocDateTo").setValue("");
            this.byId("selQuotDocTy").setSelectedKey("");
            this.byId("sfSoldTo").setValue("");
            this.byId("selQuotStatus").setSelectedKey("");

            var oBinding = this.byId("quotationTable").getBinding("items");

            if (oBinding) {
                oBinding.filter([]);
                oBinding.sort(new Sorter("QuotCd", true));
            }
        },

        onSelectQuotation: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oContext = null;

            // Table itemPress 이벤트
            if (oItem) {
                oContext = oItem.getBindingContext();
            }

            // Table selectionChange 이벤트
            if (!oContext && oEvent.getSource().getSelectedItem) {
                var oSelectedItem = oEvent.getSource().getSelectedItem();

                if (oSelectedItem) {
                    oContext = oSelectedItem.getBindingContext();
                }
            }

            // 예외 대비
            if (!oContext && oEvent.getSource().getBindingContext) {
                oContext = oEvent.getSource().getBindingContext();
            }

            if (!oContext) {
                MessageBox.warning("선택한 견적 정보를 찾을 수 없습니다.");
                return;
            }

            var oHeader = oContext.getObject();

            if (!oHeader || !oHeader.QuotCd) {
                MessageBox.warning("견적번호를 찾을 수 없습니다.");
                return;
            }

            var oViewModel = this.getView().getModel("view");
            var oModel = this.getView().getModel();

            // Header 정보 먼저 상세 영역에 반영
            oViewModel.setProperty("/selected", oHeader);
            oViewModel.setProperty("/items", []);

            // 견적 상세 화면 열기
            this.byId("fcl").setLayout("TwoColumnsMidExpanded");

            var sPath = oModel.createKey("/QuotationHeaderSet", {
                QuotCd: oHeader.QuotCd
            });

            this._oBusyDialog.open();

            oModel.read(sPath + "/ToItems", {
                success: function (oData) {
                    oViewModel.setProperty("/items", oData.results || []);
                    this._oBusyDialog.close();

                    MessageToast.show(oHeader.QuotCd + " 견적 상세를 조회했습니다.");
                }.bind(this),
                error: function (oError) {
                    this._oBusyDialog.close();

                    var sMessage = "견적 Item 정보를 조회하는 중 오류가 발생했습니다.";

                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sMessage = oResponse.error.message.value || sMessage;
                    } catch (e) {
                        // 기본 메시지 사용
                    }

                    MessageBox.error(sMessage);
                }.bind(this)
            });
        },

        onSendQuotation: function () {
            var oSelected = this.getView().getModel("view").getProperty("/selected");

            if (!oSelected || !oSelected.QuotCd) {
                MessageBox.warning("송출할 견적을 선택하세요.");
                return;
            }

            MessageBox.confirm("선택한 견적서를 송출하시겠습니까?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }

                    this._sendQuotation(oSelected.QuotCd);
                }.bind(this)
            });
        },

        _sendQuotation: function (sQuotCd) {
            var oModel = this.getView().getModel();

            this._oBusyDialog.open();

            oModel.callFunction("/SendQuotation", {
                method: "POST",
                urlParameters: {
                    QuotCd: sQuotCd
                },
                success: function (oData) {
                    this._oBusyDialog.close();

                    var oResult = oData.SendQuotation || oData;
                    var sMessage = oResult.Message || "견적서가 정상적으로 송출되었습니다.";

                    MessageToast.show(sMessage);
                }.bind(this),
                error: function (oError) {
                    this._oBusyDialog.close();

                    var sMessage = "견적서 송출 중 오류가 발생했습니다.";

                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sMessage = oResponse.error.message.value || sMessage;
                    } catch (e) {
                        // 기본 메시지 사용
                    }

                    MessageBox.error(sMessage);
                }.bind(this)
            });
        },

        // 견적 상세 화면에서 목록으로 돌아가는 버튼 핸들러
        onBackToList: function () {
            this.byId("fcl").setLayout("OneColumn");
        },

        // 문서일자 기본값을 오늘로 설정하는 헬퍼 함수
        _getToday: function () {
            var oDate = new Date();
            var sYear = oDate.getFullYear();
            var sMonth = String(oDate.getMonth() + 1).padStart(2, "0");
            var sDay = String(oDate.getDate()).padStart(2, "0");

            return sYear + "-" + sMonth + "-" + sDay;
        },

        _toODataDate: function (sDate) {
            if (!sDate) {
                return null;
            }

            return new Date(sDate + "T00:00:00");
        },

        _toODataDateString: function (sDate) {
            var sUseDate = sDate || this._getToday();
            var oDate = new Date(sUseDate + "T00:00:00");

            return "/Date(" + oDate.getTime() + ")/";
        },

        // 견적유형 라디오 버튼에서 선택된 값을 기반으로 견적 유형 코드 반환하는 헬퍼 함수
        _getCreateQuotDocTy: function () {
            var iSelectedIndex = this.byId("rbgQuotDocTy").getSelectedIndex();

            // 0: 일반제품, 1: 주문제작
            if (iSelectedIndex === 1) {
                return "O";
            }

            return "S";
        },

        // 신규 견적유형 변경 시 화면 제어용 값 세팅
        onChangeCreateQuotDocTy: function () {
            var sQuotDocTy = this._getCreateQuotDocTy();
            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty("/createQuotDocTy", sQuotDocTy);

            // 견적유형이 변경되면 Header는 유지하고 Item 입력필드만 초기화
            oViewModel.setProperty("/createItems", [
                this._createDefaultCreateItem()
            ]);

            oViewModel.setProperty("/createTotalAmount", 0);
            oViewModel.setProperty("/createCurrency", "KRW");

            MessageToast.show("견적유형이 변경되어 Item 입력값을 초기화했습니다.");
        },

        // 고객코드 Value Help
        onValueHelpSoldTo: function () {
            if (!this._oSoldToValueHelpDialog) {
                this._oSoldToValueHelpDialog = new TableSelectDialog({
                    title: "고객 선택",
                    noDataText: "조회된 고객이 없습니다.",
                    contentWidth: "45rem",
                    contentHeight: "25rem",
                    search: this.onSearchSoldToValueHelp.bind(this),
                    confirm: this.onConfirmSoldToValueHelp.bind(this),
                    cancel: function () {
                        // 취소 시 별도 처리 없음
                    }
                });

                this._oSoldToValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "고객코드" })
                }));

                this._oSoldToValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "고객명" })
                }));

                this._oSoldToValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "담당자명" })
                }));

                this._oSoldToValueHelpDialog.bindAggregation("items", {
                    path: "/CustomerVHSet",
                    template: new ColumnListItem({
                        cells: [
                            new Text({ text: "{CustomerCd}" }),
                            new Text({ text: "{CustomerNm}" }),
                            new Text({ text: "{ContactNm}" })
                        ]
                    })
                });

                this.getView().addDependent(this._oSoldToValueHelpDialog);
            }

            this._oSoldToValueHelpDialog.open();
        },

        // 고객코드 Value Help 검색
        onSearchSoldToValueHelp: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = [];

            if (sValue) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("CustomerCd", FilterOperator.Contains, sValue),
                        new Filter("CustomerNm", FilterOperator.Contains, sValue),
                        new Filter("ContactNm", FilterOperator.Contains, sValue)
                    ],
                    and: false
                }));
            }

            oEvent.getSource().getBinding("items").filter(aFilters);
        },

        // 고객코드 Value Help 선택
        onConfirmSoldToValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();

            if (!oContext) {
                return;
            }

            var oCustomer = oContext.getObject();

            this.byId("inpSoldTo").setValue(oCustomer.CustomerCd);

            this._calculateCreateQuotationAmount();
        },

        // 목록 검색조건 고객코드 Value Help
        onValueHelpFilterSoldTo: function () {
            if (!this._oFilterSoldToValueHelpDialog) {
                this._oFilterSoldToValueHelpDialog = new TableSelectDialog({
                    title: "고객 선택",
                    noDataText: "조회된 고객이 없습니다.",
                    contentWidth: "45rem",
                    contentHeight: "25rem",
                    search: this.onSearchFilterSoldToValueHelp.bind(this),
                    confirm: this.onConfirmFilterSoldToValueHelp.bind(this),
                    cancel: function () {
                        // 취소 시 별도 처리 없음
                    }
                });

                this._oFilterSoldToValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "고객코드" })
                }));

                this._oFilterSoldToValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "고객명" })
                }));

                this._oFilterSoldToValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "담당자명" })
                }));

                this._oFilterSoldToValueHelpDialog.bindAggregation("items", {
                    path: "/CustomerVHSet",
                    template: new ColumnListItem({
                        cells: [
                            new Text({ text: "{CustomerCd}" }),
                            new Text({ text: "{CustomerNm}" }),
                            new Text({ text: "{ContactNm}" })
                        ]
                    })
                });

                this.getView().addDependent(this._oFilterSoldToValueHelpDialog);
            }

            this._oFilterSoldToValueHelpDialog.open();
        },

        // 목록 검색조건 고객코드 Value Help 검색
        onSearchFilterSoldToValueHelp: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = [];

            if (sValue) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("CustomerCd", FilterOperator.Contains, sValue),
                        new Filter("CustomerNm", FilterOperator.Contains, sValue),
                        new Filter("ContactNm", FilterOperator.Contains, sValue)
                    ],
                    and: false
                }));
            }

            oEvent.getSource().getBinding("items").filter(aFilters);
        },

        // 목록 검색조건 고객코드 Value Help 선택
        onConfirmFilterSoldToValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();

            if (!oContext) {
                return;
            }

            var oCustomer = oContext.getObject();

            this.byId("sfSoldTo").setValue(oCustomer.CustomerCd);

            this.onSearch();
        },

        // 자재코드 Value Help
        onValueHelpCreateMaterial: function (oEvent) {
            this._oMaterialValueHelpInput = oEvent.getSource();

            if (!this._oMaterialValueHelpDialog) {
                this._oMaterialValueHelpDialog = new TableSelectDialog({
                    title: "자재 선택",
                    noDataText: "조회된 자재가 없습니다.",
                    contentWidth: "45rem",
                    contentHeight: "25rem",
                    search: this.onSearchCreateMaterialValueHelp.bind(this),
                    confirm: this.onConfirmCreateMaterialValueHelp.bind(this),
                    cancel: function () {
                        // 취소 시 별도 처리 없음
                    }
                });

                this._oMaterialValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "자재코드" })
                }));

                this._oMaterialValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "자재명" })
                }));

                this._oMaterialValueHelpDialog.bindAggregation("items", {
                    path: "/MaterialVHSet",
                    template: new ColumnListItem({
                        cells: [
                            new Text({ text: "{MaterialCd}" }),
                            new Text({ text: "{MaterialNm}" })
                        ]
                    })
                });

                this.getView().addDependent(this._oMaterialValueHelpDialog);
            }

            this._oMaterialValueHelpDialog.open();
        },

        // 자재코드 Value Help 검색
        onSearchCreateMaterialValueHelp: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = [];

            if (sValue) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("MaterialCd", FilterOperator.Contains, sValue),
                        new Filter("MaterialNm", FilterOperator.Contains, sValue)
                    ],
                    and: false
                }));
            }

            oEvent.getSource().getBinding("items").filter(aFilters);
        },

        // 자재코드 Value Help 선택
        onConfirmCreateMaterialValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem || !this._oMaterialValueHelpInput) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();

            if (!oContext) {
                return;
            }

            var oMaterial = oContext.getObject();
            var oItemContext = this._oMaterialValueHelpInput.getBindingContext("view");

            if (!oItemContext) {
                return;
            }

            var sPath = oItemContext.getPath();
            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty(sPath + "/MaterialCd", oMaterial.MaterialCd);

            this._calculateCreateQuotationAmount();
        },

        // Config 코드 Value Help
        onValueHelpCreateConfig: function (oEvent) {
            this._oConfigValueHelpInput = oEvent.getSource();

            if (!this._oConfigValueHelpDialog) {
                this._oConfigValueHelpDialog = new TableSelectDialog({
                    title: "Config 선택",
                    noDataText: "조회된 Config가 없습니다.",
                    contentWidth: "50rem",
                    contentHeight: "25rem",
                    search: this.onSearchCreateConfigValueHelp.bind(this),
                    confirm: this.onConfirmCreateConfigValueHelp.bind(this),
                    cancel: function () {
                        // 취소 시 별도 처리 없음
                    }
                });

                this._oConfigValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "Config 코드" })
                }));

                this._oConfigValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "자재코드" })
                }));

                this._oConfigValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "자재명" })
                }));

                this._oConfigValueHelpDialog.bindAggregation("items", {
                    path: "/ConfigVHSet",
                    template: new ColumnListItem({
                        cells: [
                            new Text({ text: "{ConfigCd}" }),
                            new Text({ text: "{MaterialCd}" }),
                            new Text({ text: "{MaterialNm}" })
                        ]
                    })
                });

                this.getView().addDependent(this._oConfigValueHelpDialog);
            }

            this._oConfigValueHelpDialog.open();
        },

        // Config 코드 Value Help 검색
        onSearchCreateConfigValueHelp: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = [];

            if (sValue) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("ConfigCd", FilterOperator.Contains, sValue),
                        new Filter("MaterialCd", FilterOperator.Contains, sValue),
                        new Filter("MaterialNm", FilterOperator.Contains, sValue)
                    ],
                    and: false
                }));
            }

            oEvent.getSource().getBinding("items").filter(aFilters);
        },

        // Config 코드 Value Help 선택
        onConfirmCreateConfigValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem || !this._oConfigValueHelpInput) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();

            if (!oContext) {
                return;
            }

            var oConfig = oContext.getObject();
            var oItemContext = this._oConfigValueHelpInput.getBindingContext("view");

            if (!oItemContext) {
                return;
            }

            var sPath = oItemContext.getPath();
            var oViewModel = this.getView().getModel("view");

            // Config 선택 시 스펙 코드와 자재코드를 함께 세팅
            oViewModel.setProperty(sPath + "/RefConfigCd", oConfig.ConfigCd);
            oViewModel.setProperty(sPath + "/MaterialCd", oConfig.MaterialCd);

            this._calculateCreateQuotationAmount();
        },

        // 지급조건 Value Help
        onValueHelpPayment: function () {
            if (!this._oPaymentValueHelpDialog) {
                this._oPaymentValueHelpDialog = new TableSelectDialog({
                    title: "지급조건 선택",
                    noDataText: "조회된 지급조건이 없습니다.",
                    contentWidth: "35rem",
                    contentHeight: "25rem",
                    search: this.onSearchPaymentValueHelp.bind(this),
                    confirm: this.onConfirmPaymentValueHelp.bind(this),
                    cancel: function () {
                        // 취소 시 별도 처리 없음
                    }
                });

                this._oPaymentValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "지급조건코드" })
                }));

                this._oPaymentValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "지급조건명" })
                }));

                this._oPaymentValueHelpDialog.bindAggregation("items", {
                    path: "/PaymentVHSet",
                    template: new ColumnListItem({
                        cells: [
                            new Text({ text: "{PaymentCd}" }),
                            new Text({ text: "{PaymentNm}" })
                        ]
                    })
                });

                this.getView().addDependent(this._oPaymentValueHelpDialog);
            }

            this._oPaymentValueHelpDialog.open();
        },

        // 지급조건 Value Help 검색
        onSearchPaymentValueHelp: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = [];

            if (sValue) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("PaymentCd", FilterOperator.Contains, sValue),
                        new Filter("PaymentNm", FilterOperator.Contains, sValue)
                    ],
                    and: false
                }));
            }

            oEvent.getSource().getBinding("items").filter(aFilters);
        },

        // 지급조건 Value Help 선택
        onConfirmPaymentValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();

            if (!oContext) {
                return;
            }

            var oPayment = oContext.getObject();

            this.byId("inpPaymentCd").setValue(oPayment.PaymentCd);
        },

        onOpenCreate: function () {
            var oFcl = this.byId("fcl");
            var oViewModel = this.getView().getModel("view");

            if (!oFcl) {
                MessageBox.error("Flexible Column Layout을 찾을 수 없습니다.");
                return;
            }

            this.byId("dpCreateDocDate").setValue(this._getToday()); // 문서일자 기본값을 오늘로 설정

            oViewModel.setProperty("/createItems", [
                this._createDefaultCreateItem()
            ]);
            oViewModel.setProperty("/createTotalAmount", 0);
            oViewModel.setProperty("/createCurrency", "KRW");

            // End Column, 즉 신규 견적 생성 화면만 전체 화면으로 표시
            oFcl.setLayout("EndColumnFullScreen");
        },

        onCloseCreate: function () {
            var oFcl = this.byId("fcl");

            if (!oFcl) {
                MessageBox.error("Flexible Column Layout을 찾을 수 없습니다.");
                return;
            }

            // 다시 견적 목록 + 견적 상세 화면으로 복귀
            oFcl.setLayout("TwoColumnsMidExpanded");
        },

        // 신규 견적 Item 기본 행 생성 함수
        _createDefaultCreateItem: function () {
            var sQuotDocTy = this._getCreateQuotDocTy();

            return {
                ItemNo: "010",
                CustItemCd: "10",
                MaterialCd: "",
                RefConfigCd: "",
                CurrentGrade: sQuotDocTy === "O" ? "N" : "A",
                ReqQty: "1",
                Unit: "EA",
                TargetMargin: sQuotDocTy === "O" ? "10.00" : "",
                IndividualAmt: 0,
                NetAmt: 0,
                Currency: "KRW"
            };
        },

        onAddCreateItem: function () {
            var oViewModel = this.getView().getModel("view");
            var aCreateItems = oViewModel.getProperty("/createItems") || [];
            var sQuotDocTy = this._getCreateQuotDocTy();

            var iNextNo = (aCreateItems.length + 1) * 10;
            var sItemNo = String(iNextNo).padStart(3, "0");

            aCreateItems.push({
                ItemNo: sItemNo,
                CustItemCd: String(iNextNo),
                MaterialCd: "",
                RefConfigCd: "",
                CurrentGrade: sQuotDocTy === "O" ? "N" : "A",
                ReqQty: "1",
                Unit: "EA",
                TargetMargin: sQuotDocTy === "O" ? "10.00" : "",
                IndividualAmt: 0,
                NetAmt: 0,
                Currency: "KRW"
            });

            oViewModel.setProperty("/createItems", aCreateItems);
            this._calculateCreateQuotationAmount();
        },

        onDeleteCreateItem: function () {
            var oTable = this.byId("createItemTable");
            var oViewModel = this.getView().getModel("view");
            var aCreateItems = oViewModel.getProperty("/createItems") || [];
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("삭제할 행을 선택하세요.");
                return;
            }

            MessageBox.confirm("선택한 행을 삭제하시겠습니까?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }

                    var aSelectedIndexes = [];

                    for (var i = 0; i < aSelectedItems.length; i++) {
                        var oContext = aSelectedItems[i].getBindingContext("view");

                        if (oContext) {
                            var sPath = oContext.getPath();
                            var iIndex = Number(sPath.split("/").pop());

                            if (!isNaN(iIndex)) {
                                aSelectedIndexes.push(iIndex);
                            }
                        }
                    }

                    // 뒤에서부터 삭제해야 index가 꼬이지 않음
                    aSelectedIndexes.sort(function (a, b) {
                        return b - a;
                    });

                    for (var j = 0; j < aSelectedIndexes.length; j++) {
                        aCreateItems.splice(aSelectedIndexes[j], 1);
                    }

                    // 모든 행이 삭제되면 기본 행 1개는 유지
                    if (aCreateItems.length === 0) {
                        aCreateItems.push(this._createDefaultCreateItem());
                    } else {
                        // ItemNo만 다시 010, 020, 030 순서로 정리
                        for (var k = 0; k < aCreateItems.length; k++) {
                            aCreateItems[k].ItemNo = String((k + 1) * 10).padStart(3, "0");
                        }
                    }

                    oViewModel.setProperty("/createItems", aCreateItems);
                    oTable.removeSelections(true);

                    this._calculateCreateQuotationAmount();

                    MessageToast.show("선택한 행을 삭제했습니다.");
                }.bind(this)
            });
        },

        // 신규 견적 입력값 초기화 함수
        onResetCreate: function () {
            this.byId("rbgQuotDocTy").setSelectedIndex(0);
            this.byId("inpSoldTo").setValue("");
            this.byId("inpCustPoCd").setValue("");
            this.byId("dpCreateReqDueDate").setValue("");
            this.byId("inpPaymentCd").setValue("");
            this.byId("dpCreateValidFrom").setValue("");
            this.byId("dpCreateValidTo").setValue("");
            this.byId("dpCreateDocDate").setValue(this._getToday());

            this.getView().getModel("view").setProperty("/createQuotDocTy", "S");
            this.getView().getModel("view").setProperty("/createItems", [
                this._createDefaultCreateItem()
            ]);
            this.getView().getModel("view").setProperty("/createTotalAmount", 0);
            this.getView().getModel("view").setProperty("/createCurrency", "KRW");

            MessageToast.show("신규 견적 입력값을 초기화했습니다.");
        },

        onCreateQuotation: function () {
            // Header에 저장될 데이터 준비.
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            var sQuotDocTy = this._getCreateQuotDocTy();    // QUOT_DOC_TY
            var sSoldTo = this.byId("inpSoldTo").getValue(); // SOLD_TO
            var sCustPoCd = this.byId("inpCustPoCd").getValue();    // CUST_PO_CD
            var sReqDueDate = this.byId("dpCreateReqDueDate").getValue();   // REQ_DUE_DATE
            var sPaymentCd = this.byId("inpPaymentCd").getValue();  // PAYMENT_TERM
            var sValidFrom = this.byId("dpCreateValidFrom").getValue(); // VALID_FROM
            var sValidTo = this.byId("dpCreateValidTo").getValue(); // VALID_TO

            var aCreateItems = oViewModel.getProperty("/createItems") || [];

            if (!sSoldTo) {
                MessageBox.warning("고객코드를 입력하세요.");
                return;
            }

            if (!sReqDueDate) {
                MessageBox.warning("요청납기일을 입력하세요.");
                return;
            }

            if (!sPaymentCd) {
                MessageBox.warning("지급조건을 입력하세요.");
                return;
            }

            if (!sValidFrom || !sValidTo) {
                MessageBox.warning("유효시작일과 유효종료일을 입력하세요.");
                return;
            }

            if (aCreateItems.length === 0) {
                MessageBox.warning("견적 Item을 최소 1건 이상 입력하세요.");
                return;
            }

            var aPayloadItems = [];

            for (var i = 0; i < aCreateItems.length; i++) {
                var oItem = aCreateItems[i];

                if (!oItem.CustItemCd) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 고객품목코드를 입력하세요.");
                    return;
                }

                if (!oItem.MaterialCd) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 자재코드를 입력하세요.");
                    return;
                }

                if (sQuotDocTy === "O" && !oItem.RefConfigCd) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 Config 코드를 입력하세요.");
                    return;
                }

                if (sQuotDocTy === "O" && !oItem.TargetMargin) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 마진율을 입력하세요.");
                    return;
                }

                if (!oItem.ReqQty || Number(oItem.ReqQty) <= 0) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 수량을 입력하세요.");
                    return;
                }

                if (sQuotDocTy === "S" && !oItem.CurrentGrade) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 등급을 입력하세요.");
                    return;
                }

                aPayloadItems.push({
                    QuotCd: "",
                    ItemCd: oItem.ItemNo,

                    // 고객품목코드
                    CustItemCd: oItem.CustItemCd,

                    // MTS는 빈 값, MTO는 ZTD2SD0014-CONFIG_CD 전달
                    RefConfigCd: sQuotDocTy === "O" ? oItem.RefConfigCd : "",

                    RefRntPlanCd: "",

                    // 자재코드는 MTS/MTO 모두 MaterialCd로 전달
                    MaterialCd: oItem.MaterialCd,

                    CurrentGrade: sQuotDocTy === "O" ? "N" : oItem.CurrentGrade,
                    ReqQty: oItem.ReqQty,
                    Unit: oItem.Unit || "EA",

                    // MTS는 0, MTO는 입력한 마진율 전달
                    TargetMargin: sQuotDocTy === "O" ? (oItem.TargetMargin || "0.00") : "0.00"
                });
            }

            var oPayload = {
                QuotCd: "",
                QuotDocTy: sQuotDocTy,
                CustPoCd: sCustPoCd,
                SoldTo: sSoldTo,
                Role: "100",
                ReqDueDate: this._toODataDate(sReqDueDate),
                PaymentCd: sPaymentCd,
                ValidFrom: this._toODataDate(sValidFrom),
                ValidTo: this._toODataDate(sValidTo),
                Currency: "KRW",
                QuotStatus: "C",

                // Header → Item Navigation Property 이름
                // QuotationItemSet은 EntitySet이름이다.
                // QuotationHeader 안에 들어갈 수 있는 Navigaion Property이름은 ToItems다.
                ToItems: aPayloadItems
            };

            this._oBusyDialog.open();

            oModel.create("/QuotationHeaderSet", oPayload, {
                success: function (oData) {
                    this._oBusyDialog.close();

                    MessageToast.show("견적이 생성되었습니다: " + oData.QuotCd);

                    oViewModel.setProperty("/selected", oData);
                    oViewModel.setProperty("/items", oData.QuotationItemSet || []);
                    oViewModel.setProperty("/createItems", []);
                    oViewModel.setProperty("/createTotalAmount", 0);
                    oViewModel.setProperty("/createCurrency", "KRW");

                    this.byId("quotationTable").getBinding("items").refresh();
                    this.byId("fcl").setLayout("TwoColumnsMidExpanded");
                }.bind(this),

                error: function (oError) {
                    this._oBusyDialog.close();

                    var sMessage = "견적 생성 중 오류가 발생했습니다.";

                    console.error("CREATE ERROR", oError);

                    if (oError.responseText) {
                        console.error("CREATE ERROR responseText", oError.responseText);
                    }

                    try {
                        var oResponse = JSON.parse(oError.responseText);

                        if (oResponse.error && oResponse.error.message && oResponse.error.message.value) {
                            sMessage = oResponse.error.message.value;
                        } else if (
                            oResponse.error &&
                            oResponse.error.innererror &&
                            oResponse.error.innererror.errordetails &&
                            oResponse.error.innererror.errordetails.length > 0
                        ) {
                            sMessage = oResponse.error.innererror.errordetails[0].message;
                        }
                    } catch (e) {
                        if (oError.message) {
                            sMessage = oError.message;
                        }
                    }

                    MessageBox.error(sMessage);
                }.bind(this)
            });
        },

        formatStatusText: function (sStatus) {
            switch (sStatus) {
                case "C":
                    return "작성완료";
                case "A":
                    return "오더전환";
                case "D":
                    return "정상종료";
                case "X":
                    return "취소";
                default:
                    return sStatus || "";
            }
        },

        formatQuotDocTyText: function (sQuotDocTy) {
            switch (sQuotDocTy) {
                case "S":
                    return "일반제품";
                case "O":
                    return "주문제작";
                case "R":
                    return "렌탈";
                default:
                    return sQuotDocTy || "";
            }
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "C":
                    return "Success";
                case "S":
                    return "Information";
                case "O":
                    return "Warning";
                case "X":
                    return "Error";
                default:
                    return "None";
            }
        },

        formatAmount: function (vAmount) {
            if (vAmount === null || vAmount === undefined || vAmount === "") {
                return "0";
            }

            var fAmount = Number(vAmount);

            if (isNaN(fAmount)) {
                return vAmount;
            }

            return fAmount.toLocaleString("ko-KR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        },

        onChangeCreateItemPrice: function () {
            this._calculateCreateQuotationAmount();
        },

        _calculateCreateQuotationAmount: function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            var sQuotDocTy = this._getCreateQuotDocTy();
            var sSoldTo = this.byId("inpSoldTo").getValue();
            var sReqDueDate = this.byId("dpCreateReqDueDate").getValue();
            var sPaymentCd = this.byId("inpPaymentCd").getValue();

            var aCreateItems = oViewModel.getProperty("/createItems") || [];
            var aPayloadItems = [];

            for (var i = 0; i < aCreateItems.length; i++) {
                var oItem = aCreateItems[i];

                if (!oItem.MaterialCd || !oItem.ReqQty || Number(oItem.ReqQty) <= 0) {
                    continue;
                }

                if (sQuotDocTy === "O" && !oItem.RefConfigCd) {
                    continue;
                }

                aPayloadItems.push({
                    QuotCd: "SIM",
                    ItemCd: oItem.ItemNo,
                    CustItemCd: oItem.CustItemCd || "",
                    RefConfigCd: sQuotDocTy === "O" ? oItem.RefConfigCd : "",
                    RefRntPlanCd: "",
                    MaterialCd: oItem.MaterialCd,
                    CurrentGrade: sQuotDocTy === "O" ? "N" : oItem.CurrentGrade,
                    ReqQty: oItem.ReqQty,
                    Unit: oItem.Unit || "EA",
                    TargetMargin: sQuotDocTy === "O" ? (oItem.TargetMargin || "0.00") : "0.00",
                    Currency: "KRW"
                });
            }

            if (aPayloadItems.length === 0) {
                oViewModel.setProperty("/createTotalAmount", 0);
                oViewModel.setProperty("/createCurrency", "KRW");
                return;
            }

            var oPayload = {
                QuotCd: "SIM",
                QuotDocTy: sQuotDocTy,
                CustPoCd: "",
                SoldTo: sSoldTo || "",
                Role: "100",
                PaymentCd: sPaymentCd || "",
                Currency: "KRW",
                QuotStatus: "C",
                ToItems: aPayloadItems
            };

            oModel.create("/QuotationSimulationSet", oPayload, {
                refreshAfterChange: false,

                success: function (oData) {
                    var aResultItems = [];

                    if (oData.ToItems && oData.ToItems.results) {
                        aResultItems = oData.ToItems.results;
                    }

                    var aCurrentItems = oViewModel.getProperty("/createItems") || [];

                    for (var i = 0; i < aCurrentItems.length; i++) {
                        for (var j = 0; j < aResultItems.length; j++) {
                            if (aCurrentItems[i].ItemNo === aResultItems[j].ItemCd) {
                                aCurrentItems[i].GrossAmt = aResultItems[j].GrossAmt || 0;
                                aCurrentItems[i].DiscountAmt = aResultItems[j].DiscountAmt || 0;
                                aCurrentItems[i].NetAmt = aResultItems[j].NetAmt || 0;
                                aCurrentItems[i].IndividualAmt = aResultItems[j].IndividualAmt || 0;
                                aCurrentItems[i].Currency = aResultItems[j].Currency || "KRW";
                            }
                        }
                    }

                    oViewModel.setProperty("/createItems", aCurrentItems);
                    oViewModel.setProperty("/createTotalAmount", oData.TtlAmount || 0);
                    oViewModel.setProperty("/createCurrency", oData.Currency || "KRW");
                }.bind(this),

                error: function (oError) {
                    console.error("SIMULATION ERROR", oError);

                    oViewModel.setProperty("/createTotalAmount", 0);
                    oViewModel.setProperty("/createCurrency", "KRW");
                }.bind(this)
            });
        },
        onAfterRendering: function () {
            var oBinding = this.byId("quotationTable").getBinding("items");

            if (oBinding) {
                oBinding.sort(new Sorter("QuotCd", true));
            }
        }
    });
});