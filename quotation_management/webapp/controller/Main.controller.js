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
    "sap/m/ColumnListItem",
    "node/t2/quotationmanagement/model/PriceCalculator"
], function (
    Controller, JSONModel, Filter, FilterOperator, Sorter, MessageBox, MessageToast, BusyDialog,
    TableSelectDialog, Column, Text, ColumnListItem, PriceCalculator
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
                createCurrency: "KRW",

                selectedPriceConditions: [],
                selectedConditionItemNo: "",
                selectedConditionNetAmt: 0,
                selectedConditionCurrency: "KRW"
            });

            this.getView().setModel(oViewModel, "view");

            this._oBusyDialog = new BusyDialog({
                title: "처리 중",
                text: "잠시만 기다려주세요."
            });

            this._iPricingRequestNo = 0;
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

            if (sSoldTo) {
                aFilters.push(new Filter("SoldTo", FilterOperator.EQ, sSoldTo));
            }

            if (sQuotStatus) {
                aFilters.push(new Filter("QuotStatus", FilterOperator.EQ, sQuotStatus));
            }

            var oBinding = this.byId("quotationTable").getBinding("items");

            if (oBinding) {
                oBinding.sort(new Sorter("QuotCd", true));
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

            if (oItem) {
                oContext = oItem.getBindingContext();
            }

            if (!oContext && oEvent.getSource().getSelectedItem) {
                var oSelectedItem = oEvent.getSource().getSelectedItem();

                if (oSelectedItem) {
                    oContext = oSelectedItem.getBindingContext();
                }
            }

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

            oViewModel.setProperty("/selected", oHeader);
            oViewModel.setProperty("/items", []);

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

            var sUseStatus = this._getQuotationUseStatus(
                oSelected.ReqDueDate,
                oSelected.ValidFrom,
                oSelected.ValidTo
            );

            if (sUseStatus === "NOT_STARTED") {
                MessageBox.warning("유효시작일이 도래하지 않은 견적서는 전송할 수 없습니다.");
                return;
            }

            if (sUseStatus === "EXPIRED_DUE") {
                MessageBox.warning("요청 납기일이 지난 견적서입니다. 사용 불가능한 견적입니다.");
                return;
            }

            if (sUseStatus === "EXPIRED_VALID") {
                MessageBox.warning("유효종료일이 지난 견적서입니다. 사용 불가능한 견적입니다.");
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

        onBackToList: function () {
            this.byId("fcl").setLayout("OneColumn");
        },

        onChangeCreateReqDueDate: function () {
            var sReqDueDate = this.byId("dpCreateReqDueDate").getValue();
            var oReqDueDate = this._parseQuotationDate(sReqDueDate);
            var oToday = this._getTodayDateOnly();

            if (oReqDueDate && oReqDueDate < oToday) {
                MessageBox.information("임시로 과거 데이터를 생성하고 있습니다.");
            }
        },

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

        _getCreateQuotDocTy: function () {
            var iSelectedIndex = this.byId("rbgQuotDocTy").getSelectedIndex();

            if (iSelectedIndex === 1) {
                return "O";
            }

            return "S";
        },
        onChangeCreateConfigCd: function (oEvent) {
            var oInput = oEvent.getSource();
            var sConfigCd = (oInput.getValue() || "").trim();
            var oItemContext = oInput.getBindingContext("view");

            if (!oItemContext) {
                return;
            }

            var sPath = oItemContext.getPath();
            var oViewModel = this.getView().getModel("view");

            /*
            * MTO에서는 Config 코드가 기준이다.
            * 스펙코드가 바뀌면 기존 자재코드와 가격계산 결과를 먼저 초기화한다.
            */
            oViewModel.setProperty(sPath + "/RefConfigCd", sConfigCd);
            oViewModel.setProperty(sPath + "/MaterialCd", "");

            this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);

            if (!sConfigCd) {
                return;
            }

            this._findMaterialByConfig(sConfigCd, sPath);
        },
        _findMaterialByConfig: function (sConfigCd, sItemPath) {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            if (!sConfigCd) {
                oViewModel.setProperty(sItemPath + "/MaterialCd", "");
                this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);
                return;
            }

            oModel.read("/ConfigVHSet", {
                filters: [
                    new Filter("ConfigCd", FilterOperator.EQ, sConfigCd)
                ],

                success: function (oData) {
                    var aConfigs = oData.results || [];

                    if (aConfigs.length === 0) {
                        oViewModel.setProperty(sItemPath + "/MaterialCd", "");
                        this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);

                        MessageBox.warning("입력한 스펙코드에 해당하는 Config 정보가 없습니다.");
                        return;
                    }

                    var oConfig = aConfigs[0];

                    oViewModel.setProperty(sItemPath + "/RefConfigCd", oConfig.ConfigCd);
                    oViewModel.setProperty(sItemPath + "/MaterialCd", oConfig.MaterialCd || "");

                    this._calculateCreateQuotationAmount();
                }.bind(this),

                error: function (oError) {
                    console.error("CONFIG READ ERROR", oError);

                    oViewModel.setProperty(sItemPath + "/MaterialCd", "");
                    this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);

                    MessageBox.error("스펙코드 기준 자재코드를 조회하는 중 오류가 발생했습니다.");
                }.bind(this)
            });
        },

        onChangeCreateQuotDocTy: function () {
            var sQuotDocTy = this._getCreateQuotDocTy();
            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty("/createQuotDocTy", sQuotDocTy);
            oViewModel.setProperty("/createItems", [
                this._createDefaultCreateItem()
            ]);

            oViewModel.setProperty("/createTotalAmount", 0);
            oViewModel.setProperty("/createCurrency", "KRW");
            oViewModel.setProperty("/selectedPriceConditions", []);
            oViewModel.setProperty("/selectedConditionItemNo", "");
            oViewModel.setProperty("/selectedConditionNetAmt", 0);
            oViewModel.setProperty("/selectedConditionCurrency", "KRW");

            MessageToast.show("견적유형이 변경되어 Item 입력값을 초기화했습니다.");
        },

        onValueHelpSoldTo: function () {
            if (!this._oSoldToValueHelpDialog) {
                this._oSoldToValueHelpDialog = new TableSelectDialog({
                    title: "고객 선택",
                    noDataText: "조회된 고객이 없습니다.",
                    contentWidth: "45rem",
                    contentHeight: "25rem",
                    search: this.onSearchSoldToValueHelp.bind(this),
                    confirm: this.onConfirmSoldToValueHelp.bind(this),
                    cancel: function () {}
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

        onValueHelpFilterSoldTo: function () {
            if (!this._oFilterSoldToValueHelpDialog) {
                this._oFilterSoldToValueHelpDialog = new TableSelectDialog({
                    title: "고객 선택",
                    noDataText: "조회된 고객이 없습니다.",
                    contentWidth: "45rem",
                    contentHeight: "25rem",
                    search: this.onSearchFilterSoldToValueHelp.bind(this),
                    confirm: this.onConfirmFilterSoldToValueHelp.bind(this),
                    cancel: function () {}
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

        onValueHelpCreateMaterial: function (oEvent) {
            this._oMaterialValueHelpInput = oEvent.getSource();

            var sQuotDocTy = this._getCreateQuotDocTy();
            var sProdStrategy = "";

            if (sQuotDocTy === "O") {
                sProdStrategy = "MTO";
            } else {
                sProdStrategy = "MTS";
            }

            this._sMaterialProdStrategy = sProdStrategy;

            if (!this._oMaterialValueHelpDialog) {
                this._oMaterialValueHelpDialog = new TableSelectDialog({
                    title: "자재 선택",
                    noDataText: "조회된 자재가 없습니다.",
                    contentWidth: "55rem",
                    contentHeight: "25rem",
                    search: this.onSearchCreateMaterialValueHelp.bind(this),
                    confirm: this.onConfirmCreateMaterialValueHelp.bind(this),
                    cancel: function () {}
                });

                this._oMaterialValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "자재코드" })
                }));

                this._oMaterialValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "자재명" })
                }));

                this._oMaterialValueHelpDialog.addColumn(new Column({
                    header: new Text({ text: "생산전략" })
                }));

                this._oMaterialValueHelpDialog.bindAggregation("items", {
                    path: "/MaterialVHSet",
                    template: new ColumnListItem({
                        cells: [
                            new Text({ text: "{MaterialCd}" }),
                            new Text({ text: "{MaterialNm}" }),
                            new Text({ text: "{ProdStrategy}" })
                        ]
                    })
                });

                this.getView().addDependent(this._oMaterialValueHelpDialog);
            }

            var oBinding = this._oMaterialValueHelpDialog.getBinding("items");

            if (oBinding) {
                oBinding.filter([
                    new Filter("ProdStrategy", FilterOperator.EQ, sProdStrategy)
                ]);
            }

            this._oMaterialValueHelpDialog.setTitle("자재 선택 - " + sProdStrategy);
            this._oMaterialValueHelpDialog.open();
        },

        onSearchCreateMaterialValueHelp: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = [];

            if (this._sMaterialProdStrategy) {
                aFilters.push(new Filter("ProdStrategy", FilterOperator.EQ, this._sMaterialProdStrategy));
            }

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
            var sQuotDocTy = this._getCreateQuotDocTy();

            oViewModel.setProperty(sPath + "/MaterialCd", oMaterial.MaterialCd);

            /*
            * MTO인 경우 자재코드 선택 후 해당 자재에 연결된 스펙코드를 자동 조회한다.
            */
            if (sQuotDocTy === "O") {
                oViewModel.setProperty(sPath + "/RefConfigCd", "");
                this._findConfigByMaterial(oMaterial.MaterialCd, sPath);
                return;
            }

            this._calculateCreateQuotationAmount();
        },
        _findConfigByMaterial: function (sMaterialCd, sItemPath) {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            if (!sMaterialCd) {
                oViewModel.setProperty(sItemPath + "/RefConfigCd", "");
                this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);
                return;
            }

            oModel.read("/ConfigVHSet", {
                filters: [
                    new Filter("MaterialCd", FilterOperator.EQ, sMaterialCd)
                ],

                success: function (oData) {
                    var aConfigs = oData.results || [];

                    if (aConfigs.length === 0) {
                        oViewModel.setProperty(sItemPath + "/RefConfigCd", "");
                        this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);

                        MessageBox.information("선택한 자재에 연결된 스펙코드가 없습니다.");
                        return;
                    }

                    if (aConfigs.length === 1) {
                        oViewModel.setProperty(sItemPath + "/MaterialCd", aConfigs[0].MaterialCd || sMaterialCd);
                        oViewModel.setProperty(sItemPath + "/RefConfigCd", aConfigs[0].ConfigCd);

                        this._calculateCreateQuotationAmount();
                        return;
                    }

                    /*
                    * 하나의 자재에 여러 스펙코드가 연결된 경우
                    * 기존 계산금액을 초기화한 뒤 해당 자재 기준 스펙 선택창을 띄운다.
                    */
                    oViewModel.setProperty(sItemPath + "/RefConfigCd", "");
                    this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);

                    this._openConfigValueHelpByMaterial(sMaterialCd, sItemPath);
                }.bind(this),

                error: function (oError) {
                    console.error("CONFIG BY MATERIAL READ ERROR", oError);

                    oViewModel.setProperty(sItemPath + "/RefConfigCd", "");
                    this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);

                    MessageBox.error("자재에 연결된 스펙코드를 조회하는 중 오류가 발생했습니다.");
                }.bind(this)
            });
        },

        _openConfigValueHelpByMaterial: function (sMaterialCd, sItemPath) {
            this._sConfigFixedMaterialCd = sMaterialCd;
            this._sConfigTargetItemPath = sItemPath;

            if (!this._oConfigValueHelpDialog) {
                this._oConfigValueHelpDialog = new TableSelectDialog({
                    title: "Config 선택",
                    noDataText: "조회된 Config가 없습니다.",
                    contentWidth: "50rem",
                    contentHeight: "25rem",
                    search: this.onSearchCreateConfigValueHelp.bind(this),
                    confirm: this.onConfirmCreateConfigValueHelp.bind(this),
                    cancel: function () {
                        this._sConfigFixedMaterialCd = "";
                        this._sConfigTargetItemPath = "";
                    }.bind(this)
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

            var oBinding = this._oConfigValueHelpDialog.getBinding("items");

            if (oBinding) {
                oBinding.filter([
                    new Filter("MaterialCd", FilterOperator.EQ, sMaterialCd)
                ]);

                oBinding.refresh(true);
            }

            this._oConfigValueHelpDialog.setTitle("Config 선택 - " + sMaterialCd);
            this._oConfigValueHelpDialog.open();
        },

        onValueHelpCreateConfig: function (oEvent) {
            this._oConfigValueHelpInput = oEvent.getSource();

            var oItemContext = this._oConfigValueHelpInput.getBindingContext("view");

            this._sConfigTargetItemPath = "";
            this._sConfigFixedMaterialCd = "";

            if (oItemContext) {
                this._sConfigTargetItemPath = oItemContext.getPath();
            }

            if (!this._oConfigValueHelpDialog) {
                this._oConfigValueHelpDialog = new TableSelectDialog({
                    title: "Config 선택",
                    noDataText: "조회된 Config가 없습니다.",
                    contentWidth: "50rem",
                    contentHeight: "25rem",
                    search: this.onSearchCreateConfigValueHelp.bind(this),
                    confirm: this.onConfirmCreateConfigValueHelp.bind(this),
                    cancel: function () {
                        this._sConfigTargetItemPath = "";
                        this._sConfigFixedMaterialCd = "";
                    }.bind(this)
                });

                this._oConfigValueHelpDialog.addColumn(new Column({
                    header: new Text({
                        text: "Config 코드"
                    })
                }));

                this._oConfigValueHelpDialog.addColumn(new Column({
                    header: new Text({
                        text: "자재코드"
                    })
                }));

                this._oConfigValueHelpDialog.addColumn(new Column({
                    header: new Text({
                        text: "자재명"
                    })
                }));

                this._oConfigValueHelpDialog.bindAggregation("items", {
                    path: "/ConfigVHSet",
                    template: new ColumnListItem({
                        cells: [
                            new Text({
                                text: "{ConfigCd}"
                            }),
                            new Text({
                                text: "{MaterialCd}"
                            }),
                            new Text({
                                text: "{MaterialNm}"
                            })
                        ]
                    })
                });

                this.getView().addDependent(this._oConfigValueHelpDialog);
            }

            var oBinding = this._oConfigValueHelpDialog.getBinding("items");

            if (oBinding) {
                oBinding.filter([]);
                oBinding.refresh(true);
            }

            this._oConfigValueHelpDialog.setTitle("Config 선택");
            this._oConfigValueHelpDialog.open();
        },
        onSearchCreateConfigValueHelp: function (oEvent) {
            var sValue = oEvent.getParameter("value") || "";
            var sSearchValue = sValue.trim();
            var aFilters = [];
            var oBinding = oEvent.getSource().getBinding("items");

            if (sSearchValue) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("ConfigCd", FilterOperator.Contains, sSearchValue),
                        new Filter("MaterialCd", FilterOperator.Contains, sSearchValue),
                        new Filter("MaterialNm", FilterOperator.Contains, sSearchValue)
                    ],
                    and: false
                }));
            }

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onConfirmCreateConfigValueHelp: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();

            if (!oContext) {
                return;
            }

            var oConfig = oContext.getObject();
            var sPath = "";

            /*
            * 자재 선택 후 스펙 선택창이 자동으로 열린 경우에는
            * _sConfigTargetItemPath에 대상 Item 경로가 이미 저장되어 있다.
            */
            if (this._sConfigTargetItemPath) {
                sPath = this._sConfigTargetItemPath;
            } else if (this._oConfigValueHelpInput) {
                var oItemContext = this._oConfigValueHelpInput.getBindingContext("view");

                if (oItemContext) {
                    sPath = oItemContext.getPath();
                }
            }

            if (!sPath) {
                return;
            }

            var oViewModel = this.getView().getModel("view");

            /*
            * 스펙코드를 선택하면 스펙코드와 자재코드를 함께 세팅한다.
            * 따라서 사용자가 스펙코드를 먼저 선택해도 자재코드가 자동 입력된다.
            */
            oViewModel.setProperty(sPath + "/RefConfigCd", oConfig.ConfigCd);
            oViewModel.setProperty(sPath + "/MaterialCd", oConfig.MaterialCd);

            this._sConfigFixedMaterialCd = "";
            this._sConfigTargetItemPath = "";

            this._calculateCreateQuotationAmount();
        },

        onValueHelpPayment: function () {
            if (!this._oPaymentValueHelpDialog) {
                this._oPaymentValueHelpDialog = new TableSelectDialog({
                    title: "지급조건 선택",
                    noDataText: "조회된 지급조건이 없습니다.",
                    contentWidth: "35rem",
                    contentHeight: "25rem",
                    search: this.onSearchPaymentValueHelp.bind(this),
                    confirm: this.onConfirmPaymentValueHelp.bind(this),
                    cancel: function () {}
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

            this._calculateCreateQuotationAmount();
        },

        onOpenCreate: function () {
            var oFcl = this.byId("fcl");
            var oViewModel = this.getView().getModel("view");

            if (!oFcl) {
                MessageBox.error("Flexible Column Layout을 찾을 수 없습니다.");
                return;
            }

            this.byId("dpCreateDocDate").setValue(this._getToday());

            oViewModel.setProperty("/createQuotDocTy", this._getCreateQuotDocTy());
            oViewModel.setProperty("/createItems", [
                this._createDefaultCreateItem()
            ]);
            oViewModel.setProperty("/createTotalAmount", 0);
            oViewModel.setProperty("/createCurrency", "KRW");
            oViewModel.setProperty("/selectedPriceConditions", []);
            oViewModel.setProperty("/selectedConditionItemNo", "");
            oViewModel.setProperty("/selectedConditionNetAmt", 0);
            oViewModel.setProperty("/selectedConditionCurrency", "KRW");

            oFcl.setLayout("EndColumnFullScreen");
        },

        onCloseCreate: function () {
            var oFcl = this.byId("fcl");

            if (!oFcl) {
                MessageBox.error("Flexible Column Layout을 찾을 수 없습니다.");
                return;
            }

            oFcl.setLayout("TwoColumnsMidExpanded");
        },

        _createDefaultCreateItem: function () {
            var sQuotDocTy = this._getCreateQuotDocTy();

            return {
                ItemNo: "010",
                CustItemCd: "10",
                MaterialCd: "",
                RefConfigCd: "",
                CurrentGrade: "N",
                ReqQty: "1",
                Unit: "EA",
                TargetMargin: sQuotDocTy === "O" ? "10.00" : "",

                GrossAmt: 0,
                DiscountAmt: 0,
                IndividualAmt: 0,
                NetAmt: 0,
                Currency: "KRW",
                PriceConditions: []
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
                CurrentGrade: "N",
                ReqQty: "1",
                Unit: "EA",
                TargetMargin: sQuotDocTy === "O" ? "10.00" : "",

                GrossAmt: 0,
                DiscountAmt: 0,
                IndividualAmt: 0,
                NetAmt: 0,
                Currency: "KRW",
                PriceConditions: []
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

                    aSelectedIndexes.sort(function (a, b) {
                        return b - a;
                    });

                    for (var j = 0; j < aSelectedIndexes.length; j++) {
                        aCreateItems.splice(aSelectedIndexes[j], 1);
                    }

                    if (aCreateItems.length === 0) {
                        aCreateItems.push(this._createDefaultCreateItem());
                    } else {
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
            this.getView().getModel("view").setProperty("/selectedPriceConditions", []);
            this.getView().getModel("view").setProperty("/selectedConditionItemNo", "");
            this.getView().getModel("view").setProperty("/selectedConditionNetAmt", 0);
            this.getView().getModel("view").setProperty("/selectedConditionCurrency", "KRW");

            MessageToast.show("신규 견적 입력값을 초기화했습니다.");
        },

        onCreateQuotation: function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            var sQuotDocTy = this._getCreateQuotDocTy();
            var sSoldTo = this.byId("inpSoldTo").getValue();
            var sCustPoCd = this.byId("inpCustPoCd").getValue();
            var sReqDueDate = this.byId("dpCreateReqDueDate").getValue();
            var sPaymentCd = this.byId("inpPaymentCd").getValue();
            var sValidFrom = this.byId("dpCreateValidFrom").getValue();
            var sValidTo = this.byId("dpCreateValidTo").getValue();

            var aCreateItems = oViewModel.getProperty("/createItems") || [];

            if (!sSoldTo) {
                MessageBox.warning("고객코드를 입력하세요.");
                return;
            }

            if (!sReqDueDate) {
                MessageBox.warning("요청납기일을 입력하세요.");
                return;
            }

            if (this._parseQuotationDate(sReqDueDate) < this._getTodayDateOnly()) {
                MessageToast.show("임시로 과거 데이터를 생성하고 있습니다.");
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

                // if (!oItem.CustItemCd) {
                //     MessageBox.warning(oItem.ItemNo + "번 행의 고객품목코드를 입력하세요.");
                //     return;
                // }

                if (!oItem.MaterialCd) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 자재코드를 입력하세요.");
                    return;
                }

                if (sQuotDocTy === "O" && !oItem.RefConfigCd) {
                    MessageBox.warning(oItem.ItemNo + "번 행의 스펙 코드를 입력하세요.");
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
                    CustItemCd: oItem.CustItemCd,
                    RefConfigCd: sQuotDocTy === "O" ? oItem.RefConfigCd : "",
                    RefRntPlanCd: "",
                    MaterialCd: oItem.MaterialCd,
                    CurrentGrade: sQuotDocTy === "O" ? "N" : oItem.CurrentGrade,
                    ReqQty: oItem.ReqQty,
                    Unit: oItem.Unit || "EA",
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
                    oViewModel.setProperty("/selectedPriceConditions", []);

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

                case "A":
                    return "Information";

                case "D":
                    return "Information";

                case "X":
                    return "Error";

                default:
                    return "None";
            }
        },
        formatStatusIcon: function (sStatus) {
            switch (sStatus) {
                case "A":
                    return "sap-icon://sales-order";

                default:
                    return "";
            }
        },
        _parseQuotationDate: function (vDate) {
            if (!vDate) {
                return null;
            }

            if (vDate instanceof Date) {
                return new Date(
                    vDate.getFullYear(),
                    vDate.getMonth(),
                    vDate.getDate()
                );
            }

            if (typeof vDate === "string") {
                var oMatch = /\/Date\((\d+)\)\//.exec(vDate);

                if (oMatch) {
                    var oODataDate = new Date(Number(oMatch[1]));

                    return new Date(
                        oODataDate.getFullYear(),
                        oODataDate.getMonth(),
                        oODataDate.getDate()
                    );
                }

                if (vDate.length >= 10) {
                    var oDate = new Date(vDate.substring(0, 10) + "T00:00:00");

                    if (!isNaN(oDate.getTime())) {
                        return new Date(
                            oDate.getFullYear(),
                            oDate.getMonth(),
                            oDate.getDate()
                        );
                    }
                }
            }

            return null;
        },

        _getTodayDateOnly: function () {
            var oToday = new Date();

            return new Date(
                oToday.getFullYear(),
                oToday.getMonth(),
                oToday.getDate()
            );
        },

        _getQuotationUseStatus: function (vReqDueDate, vValidFrom, vValidTo) {
            var oToday = this._getTodayDateOnly();
            var oReqDueDate = this._parseQuotationDate(vReqDueDate);
            var oValidFrom = this._parseQuotationDate(vValidFrom);
            var oValidTo = this._parseQuotationDate(vValidTo);

            if (oReqDueDate && oReqDueDate < oToday) {
                return "EXPIRED_DUE";
            }

            if (oValidTo && oValidTo < oToday) {
                return "EXPIRED_VALID";
            }

            if (oValidFrom && oValidFrom > oToday) {
                return "NOT_STARTED";
            }

            return "AVAILABLE";
        },
        formatQuotationUseStatusText: function (vReqDueDate, vValidFrom, vValidTo) {
            var sStatus = this._getQuotationUseStatus(vReqDueDate, vValidFrom, vValidTo);

            switch (sStatus) {
                case "EXPIRED_DUE":
                    return "납기일 지남";
                case "EXPIRED_VALID":
                    return "유효기간 지남";
                case "NOT_STARTED":
                    return "아직 시작되지 않음";
                case "AVAILABLE":
                    return "사용 가능";
                default:
                    return "";
            }
        },

        formatQuotationUseStatusState: function (vReqDueDate, vValidFrom, vValidTo) {
            var sStatus = this._getQuotationUseStatus(vReqDueDate, vValidFrom, vValidTo);

            switch (sStatus) {
                case "EXPIRED_DUE":
                case "EXPIRED_VALID":
                    return "Error";
                case "NOT_STARTED":
                    return "Warning";
                case "AVAILABLE":
                    return "Success";
                default:
                    return "None";
            }
        },

        formatQuotationUseStatusIcon: function (vReqDueDate, vValidFrom, vValidTo) {
            var sStatus = this._getQuotationUseStatus(vReqDueDate, vValidFrom, vValidTo);

            switch (sStatus) {
                case "EXPIRED_DUE":
                case "EXPIRED_VALID":
                    return "sap-icon://message-error";
                case "NOT_STARTED":
                    return "sap-icon://pending";
                case "AVAILABLE":
                    return "sap-icon://accept";
                default:
                    return "";
            }
        },

        formatSendQuotationEnabled: function (sQuotCd, vValidFrom) {
            if (!sQuotCd) {
                return false;
            }

            var oToday = this._getTodayDateOnly();
            var oValidFrom = this._parseQuotationDate(vValidFrom);

            if (oValidFrom && oValidFrom > oToday) {
                return false;
            }

            return true;
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

        formatConditionValue: function (vAmount, sUnit) {
            var sFormattedAmount = this.formatAmount(vAmount);

            if (!sUnit) {
                return sFormattedAmount;
            }

            return sFormattedAmount + " " + sUnit;
        },

        formatConditionState: function (sConditionType) {
            switch (sConditionType) {
                case "P":
                    return "Success";
                case "M":
                    return "Information";
                case "C":
                case "Q":
                case "A":
                    return "Warning";
                default:
                    return "None";
            }
        },
        onChangeCreateItemPrice: function (oEvent) {
            var sQuotDocTy = this._getCreateQuotDocTy();

            if (sQuotDocTy === "O" && this._isMaterialChangeEvent(oEvent)) {
                var oSource = oEvent.getSource();
                var oItemContext = oSource.getBindingContext("view");

                if (oItemContext) {
                    var sPath = oItemContext.getPath();
                    var sMaterialCd = oSource.getValue();
                    var oViewModel = this.getView().getModel("view");

                    oViewModel.setProperty(sPath + "/MaterialCd", sMaterialCd);
                    oViewModel.setProperty(sPath + "/RefConfigCd", "");

                    this._resetCreatePricing(oViewModel.getProperty("/createItems") || []);

                    if (sMaterialCd) {
                        this._findConfigByMaterial(sMaterialCd, sPath);
                    }

                    return;
                }
            }

            this._calculateCreateQuotationAmount();
        },

        _isMaterialChangeEvent: function (oEvent) {
            if (!oEvent || !oEvent.getSource) {
                return false;
            }

            var oSource = oEvent.getSource();

            if (!oSource.getBinding) {
                return false;
            }

            var oValueBinding = oSource.getBinding("value");

            if (!oValueBinding || !oValueBinding.getPath) {
                return false;
            }

            return oValueBinding.getPath() === "MaterialCd";
        },

        _calculateCreateQuotationAmount: function () {
            var oViewModel = this.getView().getModel("view");
            var sQuotDocTy = this._getCreateQuotDocTy();
            var aCreateItems = oViewModel.getProperty("/createItems") || [];

            if (!this._hasValidCreateItem(aCreateItems, sQuotDocTy)) {
                this._resetCreatePricing(aCreateItems);
                return;
            }

            if (sQuotDocTy === "O") {
                this._calculateCreateQuotationAmountBySimulation();
                return;
            }

            this._calculateCreateQuotationAmountByPriceCondition();
        },

        _calculateCreateQuotationAmountByPriceCondition: function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            var sQuotDocTy = this._getCreateQuotDocTy();
            var sSoldTo = this.byId("inpSoldTo").getValue();
            var aCreateItems = oViewModel.getProperty("/createItems") || [];

            this._iPricingRequestNo = (this._iPricingRequestNo || 0) + 1;
            var iCurrentRequestNo = this._iPricingRequestNo;

            oModel.read("/PriceConditionSet", {
                success: function (oData) {
                    if (iCurrentRequestNo !== this._iPricingRequestNo) {
                        return;
                    }

                    var aConditions = oData.results || [];
                    var aCurrentItems = oViewModel.getProperty("/createItems") || [];

                    var oCalculated = PriceCalculator.calculateAll(
                        aCurrentItems,
                        aConditions,
                        sQuotDocTy,
                        sSoldTo
                    );

                    oViewModel.setProperty("/createItems", oCalculated.items);
                    oViewModel.setProperty("/createTotalAmount", oCalculated.totalAmount);
                    oViewModel.setProperty("/createCurrency", oCalculated.currency);
                }.bind(this),

                error: function (oError) {
                    console.error("PRICE CONDITION READ ERROR", oError);

                    var aCurrentItems = oViewModel.getProperty("/createItems") || [];
                    this._resetCreatePricing(aCurrentItems);
                }.bind(this)
            });
        },

        _calculateCreateQuotationAmountBySimulation: function () {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            var sSoldTo = this.byId("inpSoldTo").getValue();
            var sPaymentCd = this.byId("inpPaymentCd").getValue();
            var aCreateItems = oViewModel.getProperty("/createItems") || [];

            var aPayloadItems = this._buildSimulationItems(aCreateItems);

            if (aPayloadItems.length === 0) {
                this._resetCreatePricing(aCreateItems);
                return;
            }

            this._iPricingRequestNo = (this._iPricingRequestNo || 0) + 1;
            var iCurrentRequestNo = this._iPricingRequestNo;
            var oToday = this._toODataDate(this._getToday());

            var oPayload = {
                QuotCd: "SIM",
                QuotDocTy: "O",
                CustPoCd: "",
                SoldTo: sSoldTo || "",
                Role: "100",
                ReqDueDate: oToday,
                PaymentCd: sPaymentCd || "",
                ValidFrom: oToday,
                ValidTo: oToday,
                Currency: "KRW",
                QuotStatus: "C",
                ToItems: aPayloadItems
            };

            oModel.create("/QuotationSimulationSet", oPayload, {
                refreshAfterChange: false,

                success: function (oData) {
                    if (iCurrentRequestNo !== this._iPricingRequestNo) {
                        return;
                    }

                    this._applySimulationResult(oData);
                }.bind(this),

                error: function (oError) {
                    console.error("MTO SIMULATION ERROR", oError);

                    var aCurrentItems = oViewModel.getProperty("/createItems") || [];
                    this._resetCreatePricing(aCurrentItems);

                    var sMessage = "주문제작 견적 금액 계산 중 오류가 발생했습니다.";

                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sMessage = oResponse.error.message.value || sMessage;
                    } catch (e) {
                        if (oError.message) {
                            sMessage = oError.message;
                        }
                    }

                    MessageBox.error(sMessage);
                }.bind(this)
            });
        },

        _buildSimulationItems: function (aCreateItems) {
            var aPayloadItems = [];

            for (var i = 0; i < aCreateItems.length; i++) {
                var oItem = aCreateItems[i];

                if (!oItem.MaterialCd) {
                    continue;
                }

                if (!oItem.RefConfigCd) {
                    continue;
                }

                if (!oItem.ReqQty || Number(oItem.ReqQty) <= 0) {
                    continue;
                }

                aPayloadItems.push({
                    QuotCd: "SIM",
                    ItemCd: oItem.ItemNo,
                    CustItemCd: oItem.CustItemCd || "",
                    RefConfigCd: oItem.RefConfigCd,
                    RefRntPlanCd: "",
                    MaterialCd: oItem.MaterialCd,
                    CurrentGrade: "N",
                    ReqQty: oItem.ReqQty,
                    Unit: oItem.Unit || "EA",
                    TargetMargin: oItem.TargetMargin || "0.00",
                    Currency: "KRW"
                });
            }

            return aPayloadItems;
        },

        _applySimulationResult: function (oData) {
            var oViewModel = this.getView().getModel("view");

            var aCurrentItems = oViewModel.getProperty("/createItems") || [];
            var aResultItems = [];

            if (oData.ToItems && oData.ToItems.results) {
                aResultItems = oData.ToItems.results;
            } else if (oData.QuotationItemSet && oData.QuotationItemSet.results) {
                aResultItems = oData.QuotationItemSet.results;
            }

            for (var i = 0; i < aCurrentItems.length; i++) {
                var oCurrentItem = aCurrentItems[i];
                var oResultItem = this._findResultItemByItemNo(aResultItems, oCurrentItem.ItemNo);

                if (!oResultItem) {
                    oCurrentItem.GrossAmt = 0;
                    oCurrentItem.DiscountAmt = 0;
                    oCurrentItem.IndividualAmt = 0;
                    oCurrentItem.NetAmt = 0;
                    oCurrentItem.Currency = "KRW";
                    oCurrentItem.PriceConditions = [];
                    continue;
                }

                oCurrentItem.GrossAmt = Number(oResultItem.GrossAmt || 0);
                oCurrentItem.DiscountAmt = Number(oResultItem.DiscountAmt || 0);
                oCurrentItem.IndividualAmt = Number(oResultItem.IndividualAmt || 0);
                oCurrentItem.NetAmt = Number(oResultItem.NetAmt || 0);
                oCurrentItem.Currency = oResultItem.Currency || "KRW";
                oCurrentItem.PriceConditions = this._createMtoConditionSummary(oCurrentItem, oResultItem);
            }

            oViewModel.setProperty("/createItems", aCurrentItems);
            oViewModel.setProperty("/createTotalAmount", Number(oData.TtlAmount || 0));
            oViewModel.setProperty("/createCurrency", oData.Currency || "KRW");
        },

        _findResultItemByItemNo: function (aResultItems, sItemNo) {
            for (var i = 0; i < aResultItems.length; i++) {
                if (aResultItems[i].ItemCd === sItemNo) {
                    return aResultItems[i];
                }
            }

            return null;
        },

        _createMtoConditionSummary: function (oCurrentItem, oResultItem) {
            var fGrossAmt = Number(oResultItem.GrossAmt || 0);
            var fDiscountAmt = Number(oResultItem.DiscountAmt || 0);
            var fNetAmt = Number(oResultItem.NetAmt || 0);
            var fIndividualAmt = Number(oResultItem.IndividualAmt || 0);
            var sCurrency = oResultItem.Currency || "KRW";

            var aConditions = [
                {
                    CondSeq: "001",
                    ItemNo: oCurrentItem.ItemNo,
                    PriceCondNo: oCurrentItem.RefConfigCd || "",
                    ConditionType: "P",
                    ConditionNm: "주문제작 기준금액",
                    ConditionAmt: fIndividualAmt,
                    ConditionUnit: sCurrency,
                    BaseAmt: fIndividualAmt,
                    AppliedAmt: fGrossAmt,
                    AfterAmt: fGrossAmt,
                    Currency: sCurrency,
                    MaterialCd: oCurrentItem.MaterialCd || "",
                    ApplyDesc: "스펙코드 " + oCurrentItem.RefConfigCd + " 기준으로 계산된 금액입니다."
                }
            ];

            if (Number(oCurrentItem.TargetMargin || 0) > 0) {
                aConditions.push({
                    CondSeq: "002",
                    ItemNo: oCurrentItem.ItemNo,
                    PriceCondNo: "",
                    ConditionType: "M",
                    ConditionNm: "목표마진",
                    ConditionAmt: Number(oCurrentItem.TargetMargin || 0),
                    ConditionUnit: "%",
                    BaseAmt: fGrossAmt,
                    AppliedAmt: 0,
                    AfterAmt: fGrossAmt,
                    Currency: sCurrency,
                    MaterialCd: oCurrentItem.MaterialCd || "",
                    ApplyDesc: "목표마진 " + oCurrentItem.TargetMargin + "%가 가격계산에 반영되었습니다."
                });
            }

            if (fDiscountAmt > 0) {
                aConditions.push({
                    CondSeq: String(aConditions.length + 1).padStart(3, "0"),
                    ItemNo: oCurrentItem.ItemNo,
                    PriceCondNo: "",
                    ConditionType: "C",
                    ConditionNm: "할인금액",
                    ConditionAmt: fDiscountAmt,
                    ConditionUnit: sCurrency,
                    BaseAmt: fGrossAmt,
                    AppliedAmt: -fDiscountAmt,
                    AfterAmt: fNetAmt,
                    Currency: sCurrency,
                    MaterialCd: oCurrentItem.MaterialCd || "",
                    ApplyDesc: "Gateway 가격계산 결과 할인액이 반영되었습니다."
                });
            }

            return aConditions;
        },

        _hasValidCreateItem: function (aCreateItems, sQuotDocTy) {
            for (var i = 0; i < aCreateItems.length; i++) {
                if (
                    aCreateItems[i].MaterialCd &&
                    aCreateItems[i].ReqQty &&
                    Number(aCreateItems[i].ReqQty) > 0
                ) {
                    if (sQuotDocTy === "O" && !aCreateItems[i].RefConfigCd) {
                        continue;
                    }

                    return true;
                }
            }

            return false;
        },

        _resetCreatePricing: function (aCreateItems) {
            var oViewModel = this.getView().getModel("view");

            for (var i = 0; i < aCreateItems.length; i++) {
                aCreateItems[i].GrossAmt = 0;
                aCreateItems[i].DiscountAmt = 0;
                aCreateItems[i].IndividualAmt = 0;
                aCreateItems[i].NetAmt = 0;
                aCreateItems[i].Currency = "KRW";
                aCreateItems[i].PriceConditions = [];
            }

            oViewModel.setProperty("/createItems", aCreateItems);
            oViewModel.setProperty("/createTotalAmount", 0);
            oViewModel.setProperty("/createCurrency", "KRW");
        },

        onOpenCreatePriceConditionDetail: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("view");

            if (!oContext) {
                MessageBox.warning("Item 정보를 찾을 수 없습니다.");
                return;
            }

            var oItem = oContext.getObject();

            if (!oItem) {
                MessageBox.warning("Item 정보를 찾을 수 없습니다.");
                return;
            }

            if (!oItem.PriceConditions || oItem.PriceConditions.length === 0) {
                MessageBox.information("적용된 가격조건이 없습니다. 자재, 수량, 등급을 확인하세요.");
                return;
            }

            var oViewModel = this.getView().getModel("view");

            oViewModel.setProperty("/selectedPriceConditions", oItem.PriceConditions);
            oViewModel.setProperty("/selectedConditionItemNo", oItem.ItemNo);
            oViewModel.setProperty("/selectedConditionNetAmt", oItem.NetAmt || 0);
            oViewModel.setProperty("/selectedConditionCurrency", oItem.Currency || "KRW");

            this.byId("priceConditionDialog").open();
        },

        onClosePriceConditionDialog: function () {
            this.byId("priceConditionDialog").close();
        },

        onAfterRendering: function () {
            var oBinding = this.byId("quotationTable").getBinding("items");

            if (oBinding) {
                oBinding.sort(new Sorter("QuotCd", true));
            }
        }
    });
});