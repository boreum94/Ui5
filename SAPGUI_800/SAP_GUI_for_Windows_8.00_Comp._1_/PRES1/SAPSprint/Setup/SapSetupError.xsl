<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <style type="text/css"> 
body { margin-left:0px; margin-right:0px; margin-top:0px; FONT-FAMILY:'Verdana'; FONT-SIZE:9pt; COLOR:darkblue }
      </style>
      <body>
        
        <h2 align="center">SAPSetup Error Report</h2>
        
        <br/>
        <br/>

        <table border="0" style="color:silver; FONT-WEIGHT:bold" align="center">
          <tr>
            <td width="250pt" align="left">Username:  </td>
            <td align="left"><xsl:value-of select="SapSetup/UserName"/></td>
          </tr>
          <tr>
            <td width="250pt" align="left">Computername:  </td>
            <td align="left"><xsl:value-of select="SapSetup/ComputerName"/></td>
          </tr>
          <tr>
            <td width="250pt" align="left">Date:  </td>
            <td align="left"><xsl:value-of select="SapSetup/Date"/></td>
          </tr>
          <tr>
            <td width="250pt" align="left">Time:  </td>
            <td align="left"><xsl:value-of select="SapSetup/Time"/></td>
          </tr>
        </table>
        
        <br/>
        <br/>
        <br/>
        
        <table border="1" width="95%" align="center" cellpadding="2">
          <tr bgcolor="#9acd32">
            <td width="9%" align="left">Action-Type</td>
            <td width="9%" align="left">State</td>
            <td width="24%" align="left">Error</td>
            <td width="24%" align="left">Source</td>
            <td width="24%" align="left">Destination</td>
            <td width="10%" align="left">Error-Code</td>
          </tr>
          <xsl:for-each select="SapSetup/ErrorList/Error">
            <tr>
              <td><xsl:value-of select="Type"/></td>
              <td><xsl:value-of select="State"/></td>
              <td style="color:red; font-size=8pt"><xsl:copy-of select="Description"/></td>
              <td style="color:red; font-size=8pt"><xsl:value-of select="Source"/></td>
              <td style="color:red; font-size=8pt"><xsl:value-of select="Dest"/></td>
              <td style="color:red; font-size=9pt"><xsl:value-of select="ErrorCode"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
