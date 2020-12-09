Import-Module "sqlps"
$smo = 'Microsoft.SqlServer.Management.Smo.'  
$wmi = new-object ($smo + 'Wmi.ManagedComputer').  

# List the object properties, including the instance names.  
$wmi

# Enable the TCP protocol on the default instance.  
$uri = "ManagedComputer[@Name='WIN-U1BKBN0NAL8']/ ServerInstance[@Name='MSSQLSERVER']/ServerProtocol[@Name='Tcp']"  
$Tcp = $wmi.GetSmoObject($uri)  
$Tcp.IsEnabled = $true  
$Tcp.Alter()  
$Tcp  

# Get a reference to the ManagedComputer class.  
CD SQLSERVER:\SQL\WIN-U1BKBN0NAL8  
$Wmi = (get-item .).ManagedComputer  
# Get a reference to the default instance of the Database Engine.  
$DfltInstance = $Wmi.Services['MSSQLSERVER']  
# Display the state of the service.  
$DfltInstance  
# Stop the service.  
$DfltInstance.Stop();  
# Wait until the service has time to stop.  
# Refresh the cache.  
$DfltInstance.Refresh();   
# Display the state of the service.  
$DfltInstance  
# Start the service again.  
$DfltInstance.Start();  
# Wait until the service has time to start.  
# Refresh the cache and display the state of the service.  
$DfltInstance.Refresh(); $DfltInstance 