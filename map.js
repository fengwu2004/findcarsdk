import idrMapView from './modules/idrMapView'
import idrRegionEx from './modules/idrRegionEx'
import idrUnit from './modules/idrUnit'
import idrMapMarker from './modules/IDRMapMarker/IDRMapMarker'
import idrNetworkInstance from './modules/idrNetworkManager'
import idrCoreManagerInstance from './modules/idrCoreManager'
import idrLocationServerInstance from './modules/idrLocationServer'
import idrDebug from './modules/idrDebug'

var map = {
	'idrMapView':idrMapView,
	'idrRegionEx':idrRegionEx,
	'idrUnit':idrUnit,
	'idrNetworkInstance':idrNetworkInstance,
	'idrCoreManagerInstance':idrCoreManagerInstance,
	'idrMapMarker':idrMapMarker,
	'idrDebug':idrDebug,
}

export { map as default }