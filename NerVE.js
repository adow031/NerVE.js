var svgns = "http://www.w3.org/2000/svg";

function redraw_nodes(nervejs) {
	for (var i = 0; i < nervejs.nodes.length; i++) {
		var circle;// = document.createElementNS(svgns, 'circle');
		var node = nervejs.nodes[i];
		var keys = ['radius','visible','border.thickness','border.colour','shape','rx','ry','colour'];
		dummy = getDefaults(nervejs.defaults.node,node,keys);

		t1=dummy.border.thickness;

		if (dummy.visible) {
			if(dummy['shape']=="circle") {
				shp=makeCircle(0,0,dummy['radius']);
			}
			else if(dummy['shape']="square") {
				shp=makeSquare(0,0,dummy['radius'],dummy['rx'],dummy['ry']);
			}
			shp.setAttributeNS(null, 'style', 'fill: black; stroke: black; stroke-width: 0px;' );
			node.circle.appendChild(shp);

			if(dummy['shape']=="circle") {
				shp=makeCircle(0,0,dummy['radius']);
			}
			else if(dummy['shape']="square") {
				shp=makeSquare(0,0,dummy['radius'],dummy['rx'],dummy['ry']);
			}
			shp.setAttributeNS(null, 'style', 'fill: '+dummy.colour+'; stroke: '+dummy.border.colour.normal+'; stroke-width: '+dummy.border.thickness.normal+'px;' );
			node.circle.appendChild(shp);
		}
	}

	for (var i = 0; i < nervejs.nodes.length; i++) {
		var node = nervejs.nodes[i];
		var keys = ['visible','text.offset','text.halign','text.fontsize','text.valign','text.stroke','text.fill','text.strokewidth','text.fontweight'];
		dummy = getDefaults(nervejs.defaults.node,node,keys);

		if (dummy.visible) {
			if (node.text!=undefined && node.text!=null && node.text.content!="") {
				text=document.createElementNS(svgns, 'text');
				text.setAttributeNS(null, 'x', dummy.text.offset[0]);
				text.setAttributeNS(null, 'y', dummy.text.offset[1]);
				text.setAttributeNS(null, 'text-anchor', dummy.text.halign);
				text.setAttributeNS(null, 'font-size', dummy.text.fontsize);
				text.setAttributeNS(null, 'dominant-baseline', dummy.text.valign);
				text.setAttributeNS(null, 'stroke', dummy.text.stroke);
				text.setAttributeNS(null, 'stroke-width', dummy.text.strokewidth);
				text.setAttributeNS(null, 'fill', dummy.text.fill);
				text.setAttributeNS(null, 'font-weight', dummy.text.fontweight);
				text.appendChild(document.createTextNode(node.text.content));
				node.circle.appendChild(text);
			}
			if(node.tooltip!=undefined && node.tooltip!=null && node.tooltip!="") {
				var title = document.createElementNS(svgns,"title");
				title.textContent = node.tooltip;
				node.circle.appendChild(title);
			}
		}
	}
}

function makeCircle(cx,cy,r_) {
	segment = document.createElementNS(svgns, 'circle');
	segment.setAttributeNS(null, 'cx', cx);
	segment.setAttributeNS(null, 'cy', cy);
	segment.setAttributeNS(null, 'r', r_);
	return segment;
}

function makeSquare(cx,cy,r_,rx,ry) {
	segment = document.createElementNS(svgns, 'rect');
	segment.setAttributeNS(null, 'x', cx-r_);
	segment.setAttributeNS(null, 'y', cy-r_);
	segment.setAttributeNS(null, 'width', 2*r_);
	segment.setAttributeNS(null, 'height', 2*r_);
	segment.setAttributeNS(null, 'rx', r_*rx);
	segment.setAttributeNS(null, 'ry', r_*ry);
	segment.setAttributeNS(null, 'stroke-linejoin',"round");
	return segment;
}

function render(nervejs,zoom) {
	delete nervejs.zoomTree

	var eventsHandler = {
		haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel']
	, init: function(options) {
			var instance = options.instance
				, initialScale = 1
				, pannedX = 0
				, pannedY = 0

			// Init Hammer
			// Listen only for pointer and touch events
			var hammer = Hammer(options.svgElement, {
				inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
			})

			// Enable pinch
			hammer.get('pinch').set({enable: true});

			// Handle pinch
			hammer.on('pinchstart pinchmove', function(ev){
				// On pinch start remember initial zoom

				const el = ev.target;
				const rect = el.getBoundingClientRect();
				const pos = {
				  x: (ev.center.x - rect.left),
				  y: (ev.center.y - rect.top)
				};

				if (ev.type === 'pinchstart') {
					initialScale = instance.getZoom()
					pannedX = 0
					pannedY = 0
				}

				instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
				instance.zoomAtPoint(initialScale * ev.scale, {x: pos.x+ev.deltaX - pannedX, y: pos.y+ev.deltaY - pannedY});
				pannedX = ev.deltaX
				pannedY = ev.deltaY
			})

			// Prevent moving the page on some devices when panning over SVG
			options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); });
		}

	, destroy: function(){
			hammer.destroy()
		}
	}

	createEdges(nervejs);
	createNodes(nervejs);
	redraw_nodes(nervejs);

	nervejs.zoomTree = svgPanZoom(nervejs.container, {
			zoomScaleSensitivity: 0.3,
			customEventsHandler: eventsHandler,
			preventMouseEventsDefault: true,
			dblClickZoomEnabled: false
		}
	);
	nervejs.zoomTree.zoomBy(zoom)
	nervejs.pan[0]=nervejs.container.children[1].transform.baseVal[0].matrix.e;
	nervejs.pan[1]=nervejs.container.children[1].transform.baseVal[0].matrix.f;
}

function createNodes(nervejs) {
	for (var i = 0; i < nervejs.nodes.length; i++) {
		node=nervejs.nodes[i];
		var keys = ['visible','scale'];
		dummy = getDefaults(nervejs.defaults.node,node,keys);

		delete node.circle;
		node.circle = document.createElementNS(svgns, 'svg');
		node.circle.setAttributeNS(null, 'width', 2);
		node.circle.setAttributeNS(null, 'height', 2);
		node.circle.setAttributeNS(null, 'x', -1);
		node.circle.setAttributeNS(null, 'y', -1);
		node.circle.setAttributeNS(null, 'cursor','pointer');
		node.circle.setAttributeNS(null, 'overflow','visible');
		node.circle.setAttributeNS(null, 'id', i);

		g = document.createElementNS(svgns, 'g');
		g.setAttributeNS(null,'transform',"scale("+dummy.scale.toString()+" "+dummy.scale.toString()+")");

		node.circle.appendChild(g);

		//node.circle.setAttributeNS(null, 'ondblclick',"event.stopPropagation();doubleclickEvent("+i.toString()+")");

		// node.circle.onclick = (function (network,arg) {
		// 			return function () {
		// 				event.stopPropagation();
		// 				clickEvent(network,arg,"node");
		// 			};
		// 		})(nervejs,i);
		//
		// node.circle.onmouseover = (function (network,arg) {
		//       return function () {
		// 				event.stopPropagation();
		// 				mouseoverEvent(network,arg,"node");
		//       };
		//     })(nervejs,i);

		node.circle.setAttributeNS(null, 'x', node.X);
		node.circle.setAttributeNS(null, 'y', node.Y);

		nervejs.container.appendChild(node.circle);

		node.circle = g;
	}
}

function getDefaults(deflt,obj,keys) {
	var dummy = {};
	for (k in keys) {
		items = keys[k].split('.');
		temp=obj
		temp2=dummy
		temp3=deflt;
		for(i=0;i<items.length;i++) {
			if(temp[items[i]]==undefined) {
				temp2[items[i]]=temp3[items[i]]
				break;
			}
			else {
				if(i==items.length-1) {
					if(Object.keys(temp3[items[i]]).includes("normal") && !Object.keys(temp[items[i]]).includes("normal")) {
						temp2[items[i]]={};
						temp2[items[i]]['hover']=temp3[items[i]]['hover'];
						temp2[items[i]]['select']=temp3[items[i]]['select'];
						temp2[items[i]]['normal']=temp[items[i]];
					}
					else {
						temp2[items[i]]=temp[items[i]];
					}
				}
				else {
					if(temp2[items[i]]==undefined) {
						temp2[items[i]]={};
					}
					temp=temp[items[i]];
					temp2=temp2[items[i]];
					temp3=temp3[items[i]];
				}
			}
		}
	}
	return dummy;
}

function createEdges(nervejs) {
	for (var i = 0; i < nervejs.edges.length; i++) {
		edge = nervejs.edges[i];
		var keys = ['thickness','colour','visible','dasharray','scale'];
		dummy = getDefaults(nervejs.defaults.edge,edge,keys);

		if (dummy.visible) {
			edge.line = document.createElementNS(svgns, 'line');
			line = edge.line;
			line.setAttribute('x1',nervejs.nodes[edge.from-1].X.toString());
			line.setAttribute('y1',nervejs.nodes[edge.from-1].Y.toString());
			line.setAttribute('x2',nervejs.nodes[edge.to-1].X.toString());
			line.setAttribute('y2',nervejs.nodes[edge.to-1].Y.toString());
			line.setAttribute("stroke", dummy.colour.normal);
			line.setAttribute("stroke-width", dummy.thickness.normal*dummy.scale);
			if(dummy.dasharray.normal!=null) {
				line.setAttribute("stroke-dasharray", dummy.dasharray.normal);
			}

			line = document.createElementNS(svgns, 'line');
			line.setAttribute('x1',nervejs.nodes[edge.from-1].X.toString());
			line.setAttribute('y1',nervejs.nodes[edge.from-1].Y.toString());
			line.setAttribute('x2',nervejs.nodes[edge.to-1].X.toString());
			line.setAttribute('y2',nervejs.nodes[edge.to-1].Y.toString());
			line.setAttribute('cursor','pointer');
			line.setAttribute("stroke", "rgba(0,0,0,0)");
			line.setAttribute("stroke-width", dummy.thickness.normal*dummy.scale*5);
			line.setAttribute("id", i);
			//line.setAttribute("filter","url(#my-filter)");

			// line.onclick = (function (network,arg) {
			// 			return function () {
			// 				event.stopPropagation();
			// 				clickEvent(network,arg,"edge");
			// 			};
			// 		})(nervejs,i);
			//
			// line.onmouseover = (function (network,arg) {
			// 			return function () {
			// 				event.stopPropagation();
			// 				mouseoverEvent(network,arg,"edge");
			// 			};
			// 		})(nervejs,i);

			nervejs.container.appendChild(edge.line);

			if(edge.tooltip!=undefined && edge.tooltip!=null && edge.tooltip!="") {
				var title = document.createElementNS(svgns,"title");
				title.textContent = edge.tooltip;
				line.appendChild(title);
			}
			nervejs.container.appendChild(line);
		}
	}
}

function clickEvent(nervejs,arg, obj) {
	if(arg>=0) {
		nervejs.pan[0]=nervejs.container.children[1].transform.baseVal[0].matrix.e;
		nervejs.pan[1]=nervejs.container.children[1].transform.baseVal[0].matrix.f;
	}

	if(nervejs.container.children[1].transform.baseVal[0].matrix.e!=nervejs.pan[0] || nervejs.container.children[1].transform.baseVal[0].matrix.f!=nervejs.pan[1]) {
		nervejs.pan[0]=nervejs.container.children[1].transform.baseVal[0].matrix.e;
		nervejs.pan[1]=nervejs.container.children[1].transform.baseVal[0].matrix.f;
		return;
	}

	if(nervejs.selected>=0) {
		nervejs.nodes[nervejs.selected].circle.children[0].style.strokeWidth="0px";
	}

	if(nervejs.edgeselected>=0) {
		var keys = ['thickness','colour','dasharray','scale'];
		dummy = getDefaults(nervejs.defaults.edge,nervejs.edges[nervejs.edgeselected],keys);
		nervejs.edges[nervejs.edgeselected].line.setAttribute("stroke", dummy.colour.normal);
		nervejs.edges[nervejs.edgeselected].line.setAttribute("stroke-width", dummy.thickness.normal*dummy.scale);
		nervejs.edges[nervejs.edgeselected].line.setAttribute("stroke-dasharray", dummy.dasharray.normal);
	}


	if(obj=="node" || obj=="bg") {
		if(arg==nervejs.selected && nervejs.edgeselected==-1) {
			if(typeof(doubleclickEvent)!="undefined") {
				doubleclickEvent(nervejs.selected);
				return;
			}
		}
	}

	if(obj=="edge" || obj=="bg") {
		if(arg==nervejs.edgeselected && nervejs.selected==-1) {
			if(typeof(edgedoubleclickEvent)!="undefined") {
				edgedoubleclickEvent(arg);
				return;
			}
		}
	}

	if(obj=="node" || obj=="bg") {
		nervejs.highlighted=-1;
		if(nervejs.edgeselected!=-1) {
			nervejs.edgeselected=-1;
			if (typeof edge_select === 'function') {
				edge_select(nervejs,nervejs.edgeselected);
			}
		}
		if(arg>=0) {
			node = nervejs.nodes[arg];
			keys = ['border.colour','border.thickness'];
			dummy = getDefaults(nervejs.defaults.node,node,keys);

			node.circle.children[0].style.stroke=dummy.border.colour.select;
			node.circle.children[0].style.strokeWidth=dummy.border.thickness.select.toString()+"px";
		}
		if(nervejs.selected!=arg) {
			nervejs.selected=arg;
			if (typeof node_select === 'function') {
				node_select(nervejs,nervejs.selected);
			}
		}
	}
	if(obj=="edge" || obj=="bg") {
		nervejs.edgehighlighted=-1;
		if(nervejs.selected!=-1) {
			nervejs.selected=-1;
			if (typeof node_select === 'function') {
				node_select(nervejs,nervejs.selected);
			}
		}

		if(arg>=0) {
			line = nervejs.edges[arg].line;
			keys = ['thickness','colour','dasharray','scale'];
			dummy = getDefaults(nervejs.defaults.edge,nervejs.edges[arg],keys);
			line.setAttribute("stroke", dummy.colour.select);
			line.setAttribute("stroke-width", dummy.thickness.select*dummy.scale);
			line.setAttribute("stroke-dasharray", dummy.dasharray.select);
		}
		if(nervejs.edgeselected!=arg) {
			nervejs.edgeselected=arg;
			if (typeof edge_select === 'function') {
				edge_select(nervejs,nervejs.edgeselected);
			}
		}
	}
}

function mouseoverEvent(nervejs,arg,obj) {
	if(obj=="node" && nervejs.highlighted==arg) {
		return;
	}

	if(obj=="edge" && nervejs.edgehighlighted==arg) {
		return;
	}

	if(obj=="bg" && nervejs.edgehighlighted==-1 && nervejs.highlighted==-1) {
		return;
	}

	if (nervejs.highlighted!=-1) {
		nervejs.nodes[nervejs.highlighted].circle.children[0].style.stroke="black";
		nervejs.nodes[nervejs.highlighted].circle.children[0].style.strokeWidth="0px";
	}
	if (nervejs.edgehighlighted!=-1) {
		var keys = ['thickness','colour','dasharray','scale'];
		dummy = getDefaults(nervejs.defaults.edge,nervejs.edges[nervejs.edgehighlighted],keys);
		nervejs.edges[nervejs.edgehighlighted].line.setAttribute("stroke", dummy.colour.normal);
		nervejs.edges[nervejs.edgehighlighted].line.setAttribute("stroke-width", dummy.thickness.normal*dummy.scale);
		nervejs.edges[nervejs.edgehighlighted].line.setAttribute("stroke-dasharray", dummy.dasharray.normal);
	}

	if(obj=="node" || obj=="bg") {
		if (nervejs.selected!=arg || obj=="bg") {
			nervejs.highlighted=arg;
			nervejs.edgehighlighted=-1;
			if(arg>=0) {
				node = nervejs.nodes[arg];
				keys = ['border.colour','border.thickness'];
				dummy = getDefaults(nervejs.defaults.node,node,keys);
				nervejs.nodes[arg].circle.children[0].style.stroke=dummy.border.colour.hover;
				nervejs.nodes[arg].circle.children[0].style.strokeWidth=dummy.border.thickness.hover.toString()+"px";
			}
		}
	}

	if(obj=="edge" || obj=="bg") {
		if (nervejs.edgeselected!=arg || obj=="bg") {
			nervejs.highlighted=-1;
			nervejs.edgehighlighted=arg;
			if(arg>=0) {
				var keys = ['thickness','colour','dasharray','scale'];
				dummy = getDefaults(nervejs.defaults.edge,nervejs.edges[nervejs.edgehighlighted],keys);
				nervejs.edges[nervejs.edgehighlighted].line.setAttribute("stroke", dummy.colour.hover);
				nervejs.edges[nervejs.edgehighlighted].line.setAttribute("stroke-width", dummy.thickness.hover*dummy.scale);
				nervejs.edges[nervejs.edgehighlighted].line.setAttribute("stroke-dasharray", dummy.dasharray.hover);
			}
		}
	}
}

function clearSVGnetwork(nervejs) {
	for(n in nervejs.nodes) {
		nervejs.nodes[n].circle.innerHTML="";
	}
	if (nervejs.container.parentElement!=undefined) {
		nervejs.container.parentElement.innerHTML="";
	}
}

function createSVGnetwork(nodes,edges) {
	var nervejs = {
		container: null,
		zoomTree: null,
		nodes: nodes,
		edges: edges,
	  pan: [-1,-1],
	  selected: -1,
		highlighted: -1,
		edgeselected: -1,
		edgehighlighted: -1,
	  defaults: {
			node: {
				colour: "black",
				shape: 'circle',
				scale: 1,
				border: {
					colour: {
						normal:"white",
					  hover:"grey",
						select:"black"
					},
					thickness: {
						normal:2,
						hover:5,
						select:6
					},
				},
				text: {
					valign: 'middle',
					halign: 'middle',
					offset: [0,0],
					fontsize: 24,
					stroke: 'none',
					strokewidth: 1,
					fill: 'black',
					fontweight: 'normal',
				},
				radius: 10,
				rx: 0,
				ry: 0,
				visible: true,
			},
			edge: {
				scale: 1,
				colour: {
					normal: "black",
					hover: "blue",
					select: "red",
				},
				thickness: {
					normal: 2,
					hover: 2,
					select: 2,
				},
				dasharray: {
					normal: null,
					hover: null,
					select: null,
				},
				visible:  true,
			},
		}
	};

	//container = document.createElementNS(svgns, "svg");
	container = document.createElement("div");
  svg2 = '<svg xmlns="http://www.w3.org/2000/svg">content</svg>';
	joined='<defs><filter id="my-filter" x="-20" y="-20" width="50" height="50" > <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" /> <feColorMatrix result="matrixOut" in="offOut" type="matrix" values=" 0.49 0 0 0 0 0 0.49 0 0 0 0 0 0.49 0 0 0 0 0 1 0" /> <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="9" /> <feBlend in="SourceGraphic" in2="blurOut" mode="normal" /> </filter></defs>'

	container.innerHTML = svg2.replace('content',joined);
	container = container.children[0];
	container.setAttribute ("width", "100%");
	container.setAttribute ("height", "100%");
	container.setAttributeNS(null, 'style', 'padding: 0px;' );
	container.addEventListener('wheel', evt => evt.preventDefault());
	container.onclick = (function (network) {
				return function () {
					event.stopPropagation();
					if(event.target.constructor==SVGSVGElement) {
						clickEvent(network,-1,"bg");
					}
					else if(event.target.constructor==SVGLineElement) {
						clickEvent(network,parseInt(event.target.id),"edge");
					}
					else if(event.target.parentElement.parentElement.id!=undefined) {
						clickEvent(network,parseInt(event.target.parentElement.parentElement.id),"node");
					}
				};
			})(nervejs);

	container.onmouseover = (function (nervejs,arg) {
				return function () {
					event.stopPropagation();
					if(event.target.constructor==SVGSVGElement) {
						mouseoverEvent(network,-1,"bg");
					}
					else if(event.target.constructor==SVGLineElement) {
						mouseoverEvent(network,parseInt(event.target.id),"edge");
					}
					else if(event.target.parentElement.parentElement.id!=undefined) {
						mouseoverEvent(network,parseInt(event.target.parentElement.parentElement.id),"node");
					}
				};
			})(nervejs);

	nervejs.container=container;

	return nervejs;
}
