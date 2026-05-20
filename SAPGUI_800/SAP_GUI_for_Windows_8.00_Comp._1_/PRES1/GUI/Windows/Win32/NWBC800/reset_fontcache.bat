@echo off
net stop "Windows Presentation Foundation Font Cache 3.0.0.0"
del "%systemdrive%\Documents and Settings\LocalService\Local Settings\Application Data\Fontcache3.0.0.0.dat"
del "%systemroot%\ServiceProfiles\LocalService\AppData\Local\FontCache3.0.0.0.dat"
