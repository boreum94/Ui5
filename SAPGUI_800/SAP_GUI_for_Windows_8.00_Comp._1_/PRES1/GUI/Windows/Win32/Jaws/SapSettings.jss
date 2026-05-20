
/*
 * JAWS Script file for SAPLogon
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2011/12/19 - for Screen Reader Extensions 2.41 (xSRX 33)
 */

include "HJConst.jsh"
include "HJGlobal.jsh"

/*
 * ROM 2011/12/19 : just invoke the SAPLogon scripts
 */

void function AutostartEvent ()
  SwitchToConfiguration ("SAPLogon")
endFunction

