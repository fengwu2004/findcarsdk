/**
 * Created by ky on 17-6-20.
 */

class idrGlMap {
	
	constructor(mapView) {
		
		var userAgent = navigator.userAgent.toLowerCase();
		
		this.isAndroid = userAgent.match(/android/i) == "android";
		
		this._csscale = 2.5
		
		this.screenwidth = 0
		
		this.screenheight = 0
		
		this._mapScale = 1
		
		this._mapView = mapView
		
		this._regionEx = null
		
		this._floor = null
		
		this._mapRoot = null
		
		this._canvas_txt = null
		
		this._canvas_gl = null
		
		this._floorList = []
		
		this._region = null
		
		this._currentFloorIndex = -1
		
		this._unitAddFloor = {}
		
		let self = this
		
		this.listener = {
			
			onAllFloorLoadFinish : () => {
				
				this.onAllFloorLoaded()
			},
			
			onStatusChange : function(status){
				
				console.log('地图状态改变', status)
				
				self._mapView.onMapStatusChange(status)
			},
			
			onAnimStart : function(anim){
			},
			
			onAnimFinish : function(anim){
			},
			
			onAnimCancel : function(anim){
			
			},
			
			onClick : (x, y) => {
				
				this.handleClick(x, y)
			},
			
			onScroll: (x, y) => {
				
				this.handleMapScroll(x, y)
			}
		}
	}
	
	init(regionEx, floorIndex, container) {

    this._regionEx = regionEx

    this._currentFloorIndex = floorIndex

    this._floor = this._regionEx.getFloorByIndex(floorIndex)

    this.createCanvas(container)

    for (var i = 0; i < this._regionEx.floorList.length; ++i) {

      var data = {}

      data.index = this._regionEx.floorList[i].floorIndex

      data.svg = this._regionEx.floorList[i].mapSvg

      data.deflection = this._regionEx.northDeflectionAngle
	
	    this._floorList.push(data)
    }
		
		this._region = new YFM.Map.Region("testRegion", this._canvas_gl, this._canvas_txt, this.listener);
		
		this._region.setUIScaleRate(1/this._csscale)
		
		this._region.addTexture("pubIcons", "./static/img_pub_icons.png");
		
		this._region.addTexture("parking", "./static/img_parking.png");
		
		this._region.addTextureMip("route_tex", "./static/tex_route.png");
		
		this._region.addFloorsSVG(this._floorList);
		
		this._region.setFontColor('#825537')
		
		this._region.setFontType('24px Arial')
		
		this._region.startRender();
		
		// this._region.displayFloor(this._floor.floorIndex)
		
		this._region.animPitch(0)//设置为 2d
		
		this._region.setAlwaysDrawUnit(true)
	
	  if (this.isAndroid) {
		
		  this._region.addTexture('locatepos', './static/locatepos_noheading.png')
	  }
	  else {
		
		  this._region.addTexture('locatepos', './static/locatepos.png')
	  }
		
		this._region.setLocMarkerParam('locatepos', 0x70145082, 200, 75)
  }

  changeToFloor(floorIndex) {
	
	  this._currentFloorIndex = floorIndex
	
	  this._floor = this._regionEx.getFloorByIndex(floorIndex)
	
	  // this._region.displayFloor(this._floor.floorIndex)
	
	  this.onAllFloorLoaded()
  }

  onAllFloorLoaded() {

    this._mapView._onLoadMapSuccess()
  }

  setStatus(type) {

    this._region.setStatus(type)
  }

  createEle(type, id, className) {

    var ele = document.createElement(type)

    ele.id = id

    ele.className = className

    return ele
  }
  
  getWidthAndHeightOfCancas() {
	
	  var canvas = document.getElementById("gl-canvas");
	
	  var style = window.getComputedStyle(canvas, null);
	
	  this.screenwidth = parseInt(style.getPropertyValue('width'))
	
	  this.screenheight = parseInt(style.getPropertyValue('height'))
  }

  createCanvas(containor) {
	
	  this._mapRoot = this.createEle('div', 'mapRoot', 'indoorunMap_map')
	
	  containor.appendChild(this._mapRoot)
	
	  this._canvas_gl = this.createEle('canvas', 'gl-canvas', 'canvas-frame')
	
	  this._mapRoot.appendChild(this._canvas_gl)
	
	  this._canvas_txt = this.createEle('canvas', 'txt-canvas', 'canvas-frame')
	
	  this._mapRoot.appendChild(this._canvas_txt)
	
	  this.getWidthAndHeightOfCancas()
	
	  this._canvas_gl.width = this.screenwidth * this._csscale
	
	  this._canvas_gl.height = this.screenheight * this._csscale
	
	  this._canvas_txt.width = this.screenwidth * this._csscale
	
	  this._canvas_txt.height = this.screenheight * this._csscale
  }

  updateUnitsColor(units, color) {

    units.forEach(unit => {
	
	    this._region.addQuickPolygon(this._floor.floorIndex, unit.getPts(), color)
    })
	
	  this._region.buildQuickPolygonFloor(this._floor.floorIndex)
  }

  clearUnitsColor(units) {

    units.forEach(unit => {

      unit.color = null
    })
	
	  this._region.cleanQuickPolygonFloor(this._floor.floorIndex)
  }

  clearFloorUnitsColor() {

    for (var i = 0; i < this._regionEx.floorList.length; ++i) {
	
	    this._region.cleanQuickPolygonFloor(this._regionEx.floorList[i].floorIndex)
    }
  }

  addUnits(unitList) {

    if (this._floor.id in this._unitAddFloor) {

      return
    }
	
	  this._unitAddFloor[this._floor.id] = true

    for (var i = 0; i < unitList.length; ++i) {

      var unit = unitList[i]

      var unitMapObj = {}
      
      let type = parseFloat(unit.unitTypeId)
	    
	    if (type == 0) {
      
		    unitMapObj.text = unit.fakeName? unit.fakeName:unit.name
		
		    unitMapObj.pts = unit.getPts()
		
		    unitMapObj.unitId = unit.id
		
		    unitMapObj.unitType = unit.unitTypeId
		
		    this._region.insertUnit(unitMapObj, this._floor.floorIndex)
	    }
	    else {
		
		    var pos = unit.position
		
		    this._region.insertIcon({type:type, unitId:unit.id, unitType:unit.unitTypeId}, this._floor.floorIndex, pos.x, pos.y)
	    }
    }
  }

  removeMarker(marker) {

    if (marker) {
	
	    this._region.removeMarker(marker.id)
    }
  }

  handleMapScroll(x, y) {
	
	  this._mapView._onMapScroll(x, y)
  }

  handleClick(x, y) {

    var markerId = this._region.searchMarker(x, y)

    var mapLoc = this._region.getTouchPosMapLoc(x, y)
	  
    if (markerId !== -1) {
	
	    this._mapView._onMarkerClick(this._currentFloorIndex, markerId)

      return
    }

    var units = this._region.searchUnit(x, y)

    if (units.length > 0) {
    	
    	let unit = this._mapView.findUnitWithId(units[0].obj.unitId)
	
	    this._mapView._onUnitClick(unit)

      return
    }

    var icons = this._region.searchIcon(x, y)

    if (icons.length > 0) {
	
	    let unit = this._mapView.findUnitWithId(icons[0].obj.unitId)
	
	    this._mapView._onUnitClick(unit)

      return
    }
	
	  this._mapView._onMapClick({x:mapLoc.x, y:mapLoc.y, floorIndex:this._currentFloorIndex})
  }

  addMarker(marker) {
		
		this._region.addTexture(marker.typename, marker.image)
	
	  marker.id = this._region.insertTextureMarker(marker.typename, marker.position.floorIndex, marker.position.x, marker.position.y, 0, 0, 80)
  }
  
  setPos(pos) {

    if (!pos || pos.floorIndex !== this._currentFloorIndex) {
	
	    this._region.cleanLocation()

      return
    }
	
	  this._region.setLocation(pos.floorIndex, pos.x, pos.y)
	
	  this._region.locateLaunch()
  }
  
  setUserDirection(angle) {
	
	  this._region.setAzimuth(angle)
  }

  resetMap() {
	
	  this._region.overlookMap(this._currentFloorIndex)
	
	  this._region.displayFloor(this._currentFloorIndex)
	
	  this._region.animPitch(0)//设置为 2d
  }
	
	set2DMap(value) {
	
		if (value) {
			
			this._region.displayFloor(this._currentFloorIndex)
			
			this._region.animPitch(0)//设置为 2d
			
			this._region.setAlwaysDrawUnit(true)
			
			this._region.animLookDistance(1000)
		}
		else {
			
			this._region.setAlwaysDrawUnit(false)
			
			this._region.displayRegion()
			
			this._region.animPitch(70)
		}
  }
  
  showAllFloor() {
	
	  this._region.displayRegion()
	
	  this._region.animPitch(70)
	
	  this._region.setAlwaysDrawUnit(false)
	
	  this._region.animLookDistance(2500)
  }
  
  showCurrFloor() {
	
	  this._region.setAlwaysDrawUnit(true)
	
	  this._region.displayFloor(this._currentFloorIndex)
  }

  scroll(screenVec) {


  }

  zoom(scale) {

    var dis = this._region.getLookDistance()

    if (dis < 100 || dis > 4000) {

      return
    }

    var value = dis * scale

    value = Math.min(value, 4000)

    value = Math.max(100, value)
	
	  this._region.animLookDistance(value)
  }

  birdLook() {
	
	  this._region.overlookRoute()
  }
	
	showRoutePath(points) {
		
		if (!points) {
			
			this._region.cleanRoute()
			
			return
		}
		
		this._region.setRoute(points)
	}

  getNaviStatus() {

    if (this._region) {

      return this._region.getNaviStatus()
    }

    return null
  }
	
	getScreenPos(mapPos) {

    var v = this._region.floorPos2RegionPos(mapPos.floorIndex, mapPos.x, mapPos.y)

    var p = this._region.regionPos2Screen(v)

    return {x:p[0] / this._csscale, y:p[1] / this._csscale}
  }

  centerPos(mapPos, anim) {

    if (anim) {
	
	    this._region.animLookAt(mapPos.floorIndex, mapPos.x, mapPos.y)
    }
    else {
	
	    this._region.lookAtMapLoc(mapPos.floorIndex, mapPos.x, mapPos.y)
    }

  }

  getMapScale() {

    return this._mapScale
  }

  getMapRotate() {

    return this._region.getFloorAngle(this._floor.floorIndex)
  }

  updateMarkerLocation(marker, {x,y,floorIndex}) {

    marker.id = this._region.updateMarkerLocation(marker.id, floorIndex, x, y)

    marker.position = {x,y,floorIndex}
  }

  setDynamicNavi(value) {

    if (this._region) {
	
	    this._region.setNavigateProj(value)
    }
  }
  
  root() {
		
		return this._mapRoot
  }
	
	addUnitsOverlay(units, imgfile) {
		
		this._region.addTexture(imgfile, imgfile)
		
		let type = this._region.addTRLType(imgfile)
		
		units.forEach(unit => {
			
			if (unit.floorIndex == this._floor.floorIndex) {
				
				this._region.addTRLRect(this._floor.floorIndex, type, unit.getPts())
			}
		})
		
		this._region.buildTRLRect(this._floor.floorIndex, type)
	}
	
	setThumbnailVisibility(value) {
		
		let matrixvalue = {"projMat":[0.0007320644216691069,0,0,0,0,0.0013020833333333333,0,0,0,0,-0.000018181818181818182,0,0,0,-0.8181818181818182,1],"viewMat":[1,0,0,0,0,0.3583679495453004,-0.9335804264972017,0,0,0.9335804264972017,0.3583679495453004,0,157.99999999999994,-655.826655056641,-923.8556402774992,1],"regionMat":[0.0069809625749133524,-0.5,0,0,0.5,0.0069809625749133524,0,0,0,0,0.40000000000000013,0,-3500,2000,0,3]}
		
		this._region.setThumbnailVisibility(value)
		
		this._region.setThumbnailParam(matrixvalue)
	}
	
	insertPaopao(obj, floor, x, y, offsetX, offsetY) {
		
		this._region.insertCallout(obj, floor, x, y, offsetX, offsetY)
	}
}

export { idrGlMap as default }