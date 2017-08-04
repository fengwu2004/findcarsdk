import idrMapView from './modules/idrMapView'
import idrRegionEx from './modules/idrRegionEx'
import idrUnit from './modules/idrUnit'
import idrMapMarker from './modules/IDRMapMarker/IDRMapMarker'
import idrNetworkInstance from './modules/idrNetworkManager'
import idrCoreManagerInstance from './modules/idrCoreManager'

var map = {
    'idrMapView':idrMapView,
    'idrRegionEx':idrRegionEx,
    'idrUnit':idrUnit,
    'idrNetworkInstance':idrNetworkInstance,
    'idrCoreManagerInstance':idrCoreManagerInstance,
    'idrMapMarker':idrMapMarker
}

export { map as default }