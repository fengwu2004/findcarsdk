import { idrMapView } from './modules/idrMapView'
import { idrMapInfo } from './modules/idrMapInfo'
import { idrUnit } from './modules/idrUnit'
import { idrMarker } from './modules/idrMarkers'
import { idrNetworkInstance } from './modules/idrNetworkManager'
import { idrCoreMgr } from './modules/idrCoreManager'
import idrDebug from './modules/idrDebug'
import idrWxManagerIntance from './modules/idrWxManager'
import { idrMapEvent } from "./modules/idrMapEvent";
import idrLocateServerInstance from "./modules/idrLocationServer";

window.idrMap = { idrMapView , idrRegionEx: idrMapInfo, idrUnit, idrNetworkInstance, idrCoreMgr, idrMarker, idrDebug, idrWxManagerIntance, idrMapEvent, idrLocateServerInstance }

export { idrMapView , idrMapInfo, idrUnit, idrNetworkInstance, idrCoreMgr, idrMarker, idrDebug, idrWxManagerIntance, idrMapEvent, idrLocateServerInstance}
