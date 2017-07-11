/**
 * Created by ky on 17-6-20.
 */
define(function (require, exports, module) {

    var root = modules + "../../"

    var load_queue =

        [root + "libidrn/src/yf3dmap.js",
        root + "libidrn/src/adt/ArrayList.js",
        root + "libidrn/src/adt/IndexMinPQ.js",
        root + "libidrn/src/map/Map.js",
        root + "libidrn/src/map/Region.js",
        root + "libidrn/src/map/RegionLocMarker.js",
        root + "libidrn/src/map/RegionTouchMgr.js",
        root + "libidrn/src/map/AnimationMgr.js",
        root + "libidrn/src/map/RegionRoute.js",
        root + "libidrn/src/map/Floor.js",
        root + "libidrn/src/map/FloorExtrude.js",
        root + "libidrn/src/map/FloorIcons.js",
        root + "libidrn/src/map/FloorQuickIcons.js",
        root + "libidrn/src/map/FloorMarkers.js",
        root + "libidrn/src/math/Math.js",
        root + "libidrn/src/math/Vector.js",
        root + "libidrn/src/math/Matrix.js",
        root + "libidrn/src/math/Euler.js",
        root + "libidrn/src/math/Quaternion.js",
        root + "libidrn/src/math/Line.js",
        root + "libidrn/src/math/Plane.js",
        root + "libidrn/src/math/LDS.js",
        root + "libidrn/src/math/visibility/FrustumWorldSpace.js",
        root + "libidrn/src/math/visibility/OBB.js",
        root + "libidrn/src/math/visibility/FloorQuadTree.js",
        root + "libidrn/src/math/collision/PlanePolygon.js",
        root + "libidrn/src/math/physics/Mover.js",
        root + "libidrn/src/mesh/Mesh.js",
        root + "libidrn/src/mesh/TetrahedronMesh.js",
        root + "libidrn/src/mesh/HexahedronMesh.js",
        root + "libidrn/src/mesh/OctahedronMesh.js",
        root + "libidrn/src/mesh/DodecahedronMesh.js",
        root + "libidrn/src/mesh/IcosahedronMesh.js",
        root + "libidrn/src/panorama/RawPanorama.js",
        root + "libidrn/src/webgl/WebGL.js",
        root + "libidrn/src/webgl/Color.js",
        root + "libidrn/src/webgl/BaseColorProgram.js",
        root + "libidrn/src/webgl/BasePhongProgram.js",
        root + "libidrn/src/webgl/RegionPhongProgram.js",
        root + "libidrn/src/webgl/SelectColorProgram.js",
        root + "libidrn/src/webgl/BillboardIconProgram.js",
        root + "libidrn/src/webgl/Marker2DProgram.js",
        root + "libidrn/src/webgl/PointSpiritProgram.js",
        root + "libidrn/src/webgl/RawPanoramaProgram.js",
        root + "libidrn/src/webgl/DeviceOrientationCamera.js",
        root + "libidrn/src/webgl/TexturePool.js",]

    var load_cursor = 0;

    function loadFinished() {

        load_cursor ++;

        if (load_cursor < load_queue.length) {

            loadScript();
        }
    }

    function loadError (oError) {

        console.error("The script " + oError.target.src + " is not accessible.");
    }

    function loadScript() {

        var url = load_queue[load_cursor];

        var script = document.createElement('script');

        script.type = "text/javascript";

        script.onload = function(){

            loadFinished();
        };

        script.onerror = loadError;
    
        // + '?' + 'time=' + Date.parse(new Date());
        script.src = url

        document.head.appendChild(script);
    };

    function loadMultiScript() {

        load_cursor = 0;

        loadScript();
    }

    loadMultiScript()
});