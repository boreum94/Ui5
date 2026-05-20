Set JawsDestDir=..\..\
IF EXIST saputils.jss cmd /c ""%JawsDestDir%\sCompile.exe" -d saputils.jss"
IF EXIST sapfront.jss cmd /c ""%JawsDestDir%\sCompile.exe" -d sapfront.jss"
IF EXIST saplogon.jss cmd /c ""%JawsDestDir%\sCompile.exe" -d saplogon.jss"
IF EXIST default.jss cmd /c ""%JawsDestDir%\sCompile.exe" -d default.jss"
