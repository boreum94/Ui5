Option Explicit

Sub SetRegKey(key, value)
	NwEngine.Context.Log.Write "GUI6432 Script: Set registry value '" & key & "' to '" & value & "'."
	If NwEngine.Shell.SetRegValue(key, "REG_SZ", value) Then
		NwEngine.Context.Log.Write "GUI6432 Script: Successfully set registry value '" & key & "' to '" & value & "'."
	Else
		NwEngine.Context.Log.Write "GUI6432 Script: Error setting registry value '" & key & "' to '" & value & "'."
	End If
End Sub

Sub CleanUpRegistryKey(regKey)
    NwEngine.Context.Log.Write "GUI6432 Script: Checking for registry key '" & regKey & "'"
    If NwEngine.Shell.RegKeyExist(regKey) Then
        NwEngine.Context.Log.Write "GUI6432 Script: Registry key '" & regKey & "' exists, will be deleted..."
        If NwEngine.Shell.DeleteRegKey(regKey) Then
            NwEngine.Context.Log.Write "GUI6432 Script: Successfully deleted registry key '" & regKey & "' and all containing keys and values"
        Else
            NwEngine.Context.Log.Write "GUI6432 Script: Error in deleting registry key '" & regKey & "'"
        End If
    Else
        NwEngine.Context.Log.Write "GUI6432 Script: Registry key '" & regKey & "' doesn't exist"
    End If
End Sub

Sub HandleGUIScriptingControlRegKeys()
    If NwEngine.Variables.GetValue("GUI6432AlreadyProcessed") = "TRUE" Then
        NwEngine.Context.Log.Write "GUI6432 Script: Script was already executed, exiting..."
    Else
        NwEngine.Variables.AppendDefaultValue "GUI6432AlreadyProcessed", "TRUE"
        Dim Gui32Installed : Gui32Installed = NwEngine.Variables.GetValue("SapGUI32Installed")
        Dim Gui64Installed : Gui64Installed = NwEngine.Variables.GetValue("SapGUI64Installed")
        Dim CLSIDRegKey : CLSIDRegKey = "HKCR\CLSID\{E2779C61-F87E-4038-98A0-1D9E71334706}"
		Dim AppIDRegKey : AppIDRegKey = "HKCR\AppID\{E2779C61-F87E-4038-98A0-1D9E71334706}"
        Dim RegValueAppIdPath : RegValueAppIdPath = CLSIDRegKey & "\AppId"
        Dim RegValueAppIdExist : RegValueAppIdExist = NwEngine.Shell.RegValueExist(RegValueAppIdPath)
        Dim RegValueDllPath : RegValueDllPath = AppIDRegKey & "\DllSurrogate"
        Dim RegValueDllExist : RegValueDllExist = NwEngine.Shell.RegValueExist(RegValueDllPath)

        NwEngine.Context.Log.Write "GUI6432 Script: =============================================="
        NwEngine.Context.Log.Write "GUI6432 Script: GUI32Installed: " & Gui32Installed
        NwEngine.Context.Log.Write "GUI6432 Script: GUI64Installed: " & Gui64Installed
        NwEngine.Context.Log.Write "GUI6432 Script: =============================================="
        NwEngine.Context.Log.Write "GUI6432 Script: CLSID Registry Key..: " & CLSIDRegKey
        NwEngine.Context.Log.Write "GUI6432 Script: AppId Registry Key..: " & AppIDRegKey
        NwEngine.Context.Log.Write "GUI6432 Script: AppId...............: " & RegValueAppIdExist
        NwEngine.Context.Log.Write "GUI6432 Script: DllSurrogate........: " & RegValueDllExist
        NwEngine.Context.Log.Write "GUI6432 Script: ----------------------------------------------"
        NwEngine.Context.Log.Write "GUI6432 Script: Check what to do..."
        If Gui64Installed = "TRUE" Then
            NwEngine.Context.Log.Write "GUI6432 Script: SAPGUI64 is installed, registry key '" & CLSIDRegKey & "' needs to be removed if present..."
            NwEngine.Context.Log.Write "GUI6432 Script: SAPGUI64 is installed, registry key '" & AppIDRegKey & "' needs to be removed if present..."
            CleanUpRegistryKey CLSIDRegKey
			CleanUpRegistryKey AppIDRegKey
        ElseIf Gui32Installed = "TRUE" Then
            NwEngine.Context.Log.Write "GUI6432 Script: SAPGUI32 is installed, registry values needs to be set..."
            SetRegKey RegValueAppIdPath, "{E2779C61-F87E-4038-98A0-1D9E71334706}"
            SetRegKey RegValueDllPath, ""
        Else
            NwEngine.Context.Log.Write "GUI6432 Script: SAPGUI32 and SAPGUI64 not present/uninstalling, cleaning up registry..."
            CleanUpRegistryKey CLSIDRegKey
			CleanUpRegistryKey AppIDRegKey
        End If
        NwEngine.Context.Log.Write "GUI6432 Script: =============================================="

        Dim Gui32Path : Gui32Path = NwEngine.Variables.ResolveString("%SapFrontEndDir%")
        Dim Gui64Path : Gui64Path = NwEngine.Variables.ResolveString("%SapFrontEnd64Dir%")
        Dim regKeySapFrontBase : regKeySapFrontBase = "HKCR\SapFront.App"
        Dim regKeySapFrontPath : regKeySapFrontPath = regKeySapFrontBase & "\protocol\StdFileEditing\server"
        Dim regKeySapFrontValue : regKeySapFrontValue = NwEngine.Shell.GetRegValue(regKeySapFrontPath)
        Dim existsSapLogon : existsSapLogon = NwEngine.Variables.ResolveString("ExistsSapLogon")
        Dim exeSapLogon
        If StrComp(existsSapLogon, "TRUE", 1) Then
            exeSapLogon = "saplogon.exe"
        Else
            exeSapLogon = "saplgpad.exe"
        End If
        Dim existsSapLogon64 : existsSapLogon64 = NwEngine.Variables.ResolveString("ExistsSapLogon64")
        Dim exeSapLogon64
        If StrComp(existsSapLogon64, "TRUE", 1) Then
            exeSapLogon64 = "saplogon.exe"
        Else
            exeSapLogon64 = "saplgpad.exe"
        End If
        NwEngine.Context.Log.Write "GUI6432 Script: Gui32Path.......: " & Gui32Path
        NwEngine.Context.Log.Write "GUI6432 Script: Gui64Path.......: " & Gui64Path
        NwEngine.Context.Log.Write "GUI6432 Script: Registry Value..: " & regKeySapFrontValue
        NwEngine.Context.Log.Write "GUI6432 Script: ExistsSapLogon..: " & existsSapLogon & " - " & exeSapLogon
        NwEngine.Context.Log.Write "GUI6432 Script: ExistsSapLogon64: " & existsSapLogon64 & " - " & exeSapLogon64
        NwEngine.Context.Log.Write "GUI6432 Script: ----------------------------------------------"
        NwEngine.Context.Log.Write "GUI6432 Script: Check what to do..."
        If Gui32Installed = "TRUE" Then
            Gui32Path = Gui32Path & "\" & exeSapLogon
            If StrComp(Gui32Path, regKeySapFrontValue, 1) = 0 Then
                NwEngine.Context.Log.Write "GUI6432 Script: Gui32Path and Registry Value are equal, everything fine."
            Else
                NwEngine.Context.Log.Write "GUI6432 Script: Gui32Path and Registry Value are different, set Registry Value to " & Gui32Path
                SetRegKey regKeySapFrontPath, Gui32Path
            End If
        ElseIf Gui64Installed = "TRUE" Then
            Gui64Path = Gui64Path & "\" & exeSapLogon64
            If StrComp(Gui64Path, regKeySapFrontValue, 1) = 0 Then
                NwEngine.Context.Log.Write "GUI6432 Script: Gui64Path and Registry Value are equal, everything fine."
            Else
                NwEngine.Context.Log.Write "GUI6432 Script: Gui64Path and Registry Value are different, set Registry Value to " & Gui64Path
                SetRegKey regKeySapFrontPath, Gui64Path
            End If
        Else
            NwEngine.Context.Log.Write "GUI6432 Script: Neither GUI32 nor GUI64 are installed, cleaning up."
            CleanUpRegistryKey regKeySapFrontBase
        End If
        NwEngine.Context.Log.Write "GUI6432 Script: =============================================="
    End If
End Sub