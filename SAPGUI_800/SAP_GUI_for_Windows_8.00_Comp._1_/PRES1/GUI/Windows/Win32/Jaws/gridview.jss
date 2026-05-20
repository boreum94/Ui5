
/*
 * JAWS Script file for SAPLogon
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2019/05/23
 */

include "HJConst.jsh"
include "HJGlobal.jsh"

/*
 * ROM 2018/11/20 : just invoke the sapfront scripts
 */

void function AutostartEvent ()
  SwitchToConfiguration ("sapfront")
endFunction

