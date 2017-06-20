/**
 * Created by ky on 17-6-20.
 */
define(function (require, exports, module) {

    var root = modules + "/../"

    var load_queue =

        [root + "../src/yf3dmap.js",
        root + "../src/adt/ArrayList.js",
        root + "../src/adt/IndexMinPQ.js",
        root + "../src/map/Map.js",
        root + "../src/map/Region.js",
        root + "../src/map/RegionLocMarker.js",
        root + "../src/map/RegionTouchMgr.js",
        root + "../src/map/AnimationMgr.js",
        root + "../src/map/RegionRoute.js",
        root + "../src/map/Floor.js",
        root + "../src/map/FloorExtrude.js",
        root + "../src/map/FloorIcons.js",
        root + "../src/map/FloorQuickIcons.js",
        root + "../src/map/FloorMarkers.js",
        root + "../src/math/Math.js",
        root + "../src/math/Vector.js",
        root + "../src/math/Matrix.js",
        root + "../src/math/Euler.js",
        root + "../src/math/Quaternion.js",
        root + "../src/math/Line.js",
        root + "../src/math/Plane.js",
        root + "../src/math/LDS.js",
        root + "../src/math/visibility/FrustumWorldSpace.js",
        root + "../src/math/visibility/OBB.js",
        root + "../src/math/visibility/FloorQuadTree.js",
        root + "../src/math/collision/PlanePolygon.js",
        root + "../src/math/physics/Mover.js",
        root + "../src/mesh/Mesh.js",
        root + "../src/mesh/TetrahedronMesh.js",
        root + "../src/mesh/HexahedronMesh.js",
        root + "../src/mesh/OctahedronMesh.js",
        root + "../src/mesh/DodecahedronMesh.js",
        root + "../src/mesh/IcosahedronMesh.js",
        root + "../src/panorama/RawPanorama.js",
        root + "../src/webgl/WebGL.js",
        root + "../src/webgl/Color.js",
        root + "../src/webgl/BaseColorProgram.js",
        root + "../src/webgl/BasePhongProgram.js",
        root + "../src/webgl/RegionPhongProgram.js",
        root + "../src/webgl/SelectColorProgram.js",
        root + "../src/webgl/BillboardIconProgram.js",
        root + "../src/webgl/Marker2DProgram.js",
        root + "../src/webgl/PointSpiritProgram.js",
        root + "../src/webgl/RawPanoramaProgram.js",
        root + "../src/webgl/DeviceOrientationCamera.js",
        root + "../src/webgl/TexturePool.js",]

    var load_cursor = 0;

    var loadFinished = function() {

        load_cursor ++;

        if (load_cursor < load_queue.length) {

            loadScript();
        }
    }

    function loadError (oError) {

        console.error("The script " + oError.target.src + " is not accessible.");
    }

    var loadScript = function() {

        var url = load_queue[load_cursor];

        var script = document.createElement('script');

        script.type = "text/javascript";

        script.onload = function(){

            loadFinished();
        };

        script.onerror = loadError;

        script.src = url + '?' + 'time=' + Date.parse(new Date());

        document.body.appendChild(script);
    };

    var loadMultiScript = function() {

        load_cursor = 0;

        loadScript();
    }

    loadMultiScript()
});