Sub Sleep(seconds)
	Dim jetzt : jetzt = Now
	while DateDiff("s", jetzt, Now) < seconds
	WEnd
End Sub
					
Sub ExecuteVCInstall(runtimeVersion, runtimeBitness, parameter)
    If NwEngine.Variables.GetValue("EXECUTED_BY_MSIEXEC") = "TRUE" Then
        NwEngine.Context.Log.WriteWarning logstring & "---------------------------------------------------------------------------------"
        NwEngine.Context.Log.WriteWarning logstring & "Installation of VC Runtime " & runtimeVersion & " is disabled due to "
        NwEngine.Context.Log.WriteWarning logstring & "execution from msiexec.exe. This runtime installer uses internally "
        NwEngine.Context.Log.WriteWarning logstring & "MSI files, which cannot be executed, because msiexec.exe is already "
        NwEngine.Context.Log.WriteWarning logstring & "running and this prevents a second execution."
        NwEngine.Context.Log.WriteWarning logstring & "You need to install all needed runtimes before you execute this installer."
        NwEngine.Context.Log.WriteWarning logstring & "---------------------------------------------------------------------------------"
        Exit Sub
    End If

    If NwEngine.Variables.GetValue("Disable_VC_Runtimes_Installation") = "TRUE" Then
        NwEngine.Context.Log.WriteWarning logstring & "---------------------------------------------------------------------------------"
        NwEngine.Context.Log.WriteWarning logstring & "Installation of VC Runtime " & runtimeVersion & " is disabled as "
        NwEngine.Context.Log.WriteWarning logstring & "command line parameter /DisableRuntimeInstall was supplied "
        NwEngine.Context.Log.WriteWarning logstring & "to NwSapSetup.exe. "
        NwEngine.Context.Log.WriteWarning logstring & "You need to install all needed runtimes before you execute this installer."
        NwEngine.Context.Log.WriteWarning logstring & "---------------------------------------------------------------------------------"
        Exit Sub
    End If

	Dim logString : logString = "VC" & runtimeVersion & "RT" & runtimeBitness & " Script: "
	Dim runtimeExe : runtimeExe = NwEngine.Variables.ResolveString("%SapSrcDir%\System\VC" & runtimeVersion & "\vc" & runtimeVersion & "redist_" & runtimeBitness & ".exe")
	Dim runtimeLog : runtimeLog = NwEngine.Variables.ResolveString("%SAPSETUPDIR%\LOGs\vc" & runtimeVersion & "redist_" & runtimeBitness & ".log")
	Dim executeCmd : executeCmd = Chr(34) & runtimeExe & Chr(34) & " /log " & Chr(34) & runtimeLog & Chr(34) & " " & parameter

	NwEngine.Context.Log.Write logString & "Executing " & executeCmd
	Dim shellObj : Set shellObj = CreateObject("WScript.Shell")
	Dim execObj
    If runtimeVersion = 8 Then
        Set execObj = shellObj.Exec(Chr(34) & runtimeExe & Chr(34) & " " & parameter)
	ElseIf runtimeVersion = 9 Then
		Set execObj = shellObj.Exec(Chr(34) & runtimeExe & Chr(34) & " /l " & Chr(34) & runtimeLog & Chr(34) & " " & parameter)
    Else
        Set execObj = shellObj.Exec(Chr(34) & runtimeExe & Chr(34) & " /log " & Chr(34) & runtimeLog & Chr(34) & " " & parameter)
    End If
	Dim maxWaitTime
	If runtimeVersion = 8 Or runtimeVersion = 9 Then
		maxWaitTime = 720000
	Else
		maxWaitTime = 360000
	End If
	Dim currentWaitTime : currentWaitTime = 0
	Dim stepWaitTime: stepWaitTime = 2000
	NwEngine.Context.Log.Write logString & "Waiting up to " & (maxWaitTime / 1000) & " seconds for " & executeCmd
	Do While execObj.Status = 0 And maxWaitTime > currentWaitTime
		Sleep (stepWaitTime / 1000)
		currentWaitTime = currentWaitTime + stepWaitTime
	Loop
	Dim ExitCode
	If execObj.Status = 0 Then
		NwEngine.Context.Log.WriteWarning logString & executeCmd
		NwEngine.Context.Log.WriteWarning logString & "didn't finish in " & (maxWaitTime / 1000) & " seconds, checking logfile for return code..."
        Dim logFile : logFile = runtimeLog
        Dim searchString
		If runtimeVersion = 10 Then
			logFile = logFile + "-MSI_vc_red.msi.txt"
			searchString = "MainEngineThread is returning "
		ElseIf runtimeVersion = 8 Then
			searchString = "Installation success or error status: "
		ElseIf runtimeVersion = 9 Then
			searchString = "MainEngineThread is returning "
		Else
            searchString = "Exit code: "
		End If
		
		NwEngine.Context.Log.Write logString & "Terminating process " & executeCmd
		shellObj.Run "taskkill.exe /PID " & execObj.ProcessId & " /T /F", 0, True
		shellObj.Run "taskkill.exe /IM msiexec.exe /T /F", 0, True
		
		currentWaitTime = 0
		stepWaitTime = 2000
		maxWaitTime = 60000
		NwEngine.Context.Log.Write logstring & "Checking is msiexec.exe is still running or not..."
		Do While maxWaitTime > currentWaitTime
			If shellObj.Run("tasklist.exe /FI " & Chr(34) & "IMAGENAME eq msiexex.exe" & Chr(34) & " |findstr.exe /I msiexec.exe", 0, True) <> 0 Then
				NwEngine.Context.Log.Write logString & "msiexec.exe is stopped (Wait time: " & currentWaitTime & " ms)..."
				Exit Do
			End If
			Sleep (stepWaitTime / 1000)
			currentWaitTime = currentWaitTime + stepWaitTime
		Loop

		Dim fsoObj : Set fsoObj = CreateObject("Scripting.FileSystemObject")
		On Error Resume Next
		NwEngine.Context.Log.WriteWarning logString & "Using logfile " & logFile
		Dim textFileObj : Set textFileObj = fsoObj.OpenTextFile(logFile, 1, False, -1)
		If Err.Number <> 0 Then
			NwEngine.Context.Log.WriteError logString & "Error opening file " & logFile
			NwEngine.Context.Log.WriteError logString & "Error Code........: " & Err.Number
			NwEngine.Context.Log.WriteError logString & "Error Source......: " & Err.Source
			NwEngine.Context.Log.WriteError logString & "Error Description.: " & Err.Description
			Exit Sub
		End If
		On Error GoTo 0
		NwEngine.Context.Log.WriteWarning logString & "Checking logfile for searchString '" & searchString & "'..."
		Dim returnCode : returnCode = -1
		Do Until textFileObj.AtEndOfStream
			Dim logLine : logLine = textFileObj.ReadLine
            Dim pos : pos = InStr(logLine, searchString)
            If pos > 0 Then
				Dim retString
				NwEngine.Context.Log.Write logstring & "Checking line " & logLine
				If runtimeVersion = 9 Or runtimeVersion = 10 Then
					pos = pos + Len(searchString)
					retString = Mid(logLine, pos)
					returnCode = CInt(retString)
				ElseIf runtimeVersion = 8 Then
					pos = pos + Len(searchString)
					retString = Replace(Mid(logLine, pos), ".", "")
					returnCode = CInt(retString)
				Else
					pos = pos + Len(searchString) + 2
					Dim spacePos : spacePos = InStr(pos, logLine, ",")
					returnCode = CInt("&H" & Mid(logLine, pos, spacePos - pos))
				End If
			End If
		Loop
		textFileObj.Close
		ExitCode = returnCode
	Else
		ExitCode = execObj.ExitCode
	End If
	If ExitCode = 0 Then
		NwEngine.Context.Log.Write logString & "Executing '" & executeCmd & "' finished with return code: " & ExitCode
		NwEngine.Context.Log.Write logString & "ExitCode 0: The action completed successfully."
	ElseIf ExitCode = 1638 Then
		NwEngine.Context.Log.Write logString & "Executing '" & executeCmd & "' finished with return code: " & ExitCode
		NwEngine.Context.Log.Write logString & "ExitCode 1638: Newer version of the runtime is already installed."
	ElseIf ExitCode = 3010 Then
		NwEngine.Context.Log.WriteWarning logString & "Executing '" & executeCmd & "' finished with return code: " & ExitCode
		NwEngine.Context.Log.WriteWarning logString & "ExitCode 3010: A restart is required to complete the install."
		If NwEngine.Context.Reboot = 0 Then
			NwEngine.Context.Reboot = 1
		End If
	Else
		NwEngine.Context.Log.WriteError logString & "Executing '" & executeCmd & "' finished with return code: " & ExitCode
		NwEngine.Context.Log.WriteError logString & "ExitCode " & ExitCode
		NwEngine.Context.Log.WriteError logString & "Check return code here: https://msdn.microsoft.com/en-us/library/windows/desktop/aa376931(v=vs.85).aspx"
	End If
End Sub
