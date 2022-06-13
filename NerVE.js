var svgns = "http://www.w3.org/2000/svg";

function redraw_nodes(nervejs) {
	for (var i = 0; i < nervejs.nodes.length; i++) {
		var circle;// = document.createElementNS(svgns, 'circle');
		var node = nervejs.nodes[i];

		if (node.dims==undefined) {
			dims=nervejs.defaults.node.dims;
		}
		else {
			dims=node.dims;
		}
		if (node.radius==undefined) {
			radius=nervejs.defaults.node.radius;
		}
		else {
			radius=node.radius;
		}
		if (node.visible==undefined) {
			visible=nervejs.defaults.node.visible;
		}
		else {
			visible=node.visible;
		}
		if (node.border==undefined) {
			border=nervejs.defaults.node.border;
		}
		else {
			border=node.border;
		}
		if (node.circle["colour"]!=undefined) {
			colour = node.circle["colour"]
		}
		else if(node.colour!=undefined) {
			colour = node.colour
		}
		else {
			colour = nervejs.defaults.node.colour;
		}

		if (visible) {
			circle=makeCircle(dims[0],dims[1],radius);
			circle.setAttributeNS(null, 'style', 'fill: black; stroke: black; stroke-width: 0px;' );
			node.circle.appendChild(circle);

			circle=makeCircle(dims[0],dims[1],radius);

			circle.setAttributeNS(null, 'style', 'fill: '+colour+'; stroke: white; stroke-width: '+border.thickness.toString()+'px;' );

			node.circle.appendChild(circle);
		}
	}

	for (var i = 0; i < nervejs.nodes.length; i++) {
		var node = nervejs.nodes[i];
		if (node.visible==undefined) {
			visible=nervejs.defaults.node.visible;
		}
		else {
			visible=node.visible;
		}
		if (visible) {
			if (node.text!=undefined && node.text!=null) {
				text=document.createElementNS(svgns, 'text');
				text.setAttributeNS(null, 'x', node.text.offset[0]);
				text.setAttributeNS(null, 'y', node.text.offset[1]);
				text.setAttributeNS(null, 'text-anchor', node.text.halign);
				text.setAttributeNS(null, 'font-size', node.text.fontsize);
				text.setAttributeNS(null, 'dominant-baseline', node.text.valign);
				text.appendChild(document.createTextNode(node.text.content));
				node.circle.appendChild(text);
			}
			var title = document.createElementNS(svgns,"title");
			title.textContent = node.title;
			node.circle.appendChild(title);
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

function render(nervejs,zoom) {
	delete nervejs.zoomTree
	nervejs.zoomTree = svgPanZoom(nervejs.container, {zoomScaleSensitivity: 0.3,preventMouseEventsDefault: false, dblClickZoomEnabled: false});
	nervejs.zoomTree.zoomBy(zoom)
	nervejs.pan=[-1,-1];
}

function createNodes(nervejs) {
	for (var i = 0; i < nervejs.nodes.length; i++) {
		node=nervejs.nodes[i];
		if (node.box==undefined) {
			box=nervejs.defaults.node.box;
		}
		else {
			box=node.box;
		}
		if (node.padding==undefined) {
			padding=nervejs.defaults.node.padding;
		}
		else {
			padding=node.padding;
		}
		if (node.visible==undefined) {
			visible=nervejs.defaults.node.visible;
		}
		else {
			visible=node.visible;
		}
		delete node.circle;
		node.circle = document.createElementNS(svgns, 'svg');
		node.circle.setAttributeNS(null, 'width', box[0]+padding[0]);
		node.circle.setAttributeNS(null, 'height', box[1]+padding[1]);
		node.circle.setAttributeNS(null, 'cursor','pointer');
		node.circle.setAttributeNS(null, 'ondblclick',"event.stopPropagation();doubleclickEvent("+i.toString()+")");

		node.circle.onclick = (function (nervejs,arg) {
					return function () {
						event.stopPropagation();
						clickEvent(nervejs,arg);
					};
				})(nervejs,i);

		node.circle.onmouseover = (function (nervejs,arg) {
		      return function () {
						event.stopPropagation();
						mouseoverEvent(nervejs,arg);
		      };
		    })(nervejs,i);
		node.circle.setAttributeNS(null, 'x', node.X-box[0]/2);
		node.circle.setAttributeNS(null, 'y', node.Y-box[1]/2);
		nervejs.container.appendChild(node.circle);
	}
}

function createEdges(nervejs) {
	for (var i = 0; i < nervejs.edges.length; i++) {
		edge = nervejs.edges[i];
		if (edge.visible==undefined) {
			visible=nervejs.defaults.edge.visible;
		}
		else {
			visible=edge.visible;
		}
		if (edge.colour==undefined) {
			colour=nervejs.defaults.edge.colour;
		}
		else {
			colour=edge.colour;
		}
		if (edge.thickness==undefined) {
			thickness=nervejs.defaults.edge.thickness;
		}
		else {
			thickness=edge.thickness;
		}
		if (visible) {
			line = document.createElementNS(svgns, 'line');
			line.setAttribute('x1',nervejs.nodes[edge.from-1].X.toString());
			line.setAttribute('y1',nervejs.nodes[edge.from-1].Y.toString());
			line.setAttribute('x2',nervejs.nodes[edge.to-1].X.toString());
			line.setAttribute('y2',nervejs.nodes[edge.to-1].Y.toString());
			line.setAttribute("stroke", colour);
			line.setAttribute("stroke-width", thickness);
			nervejs.container.appendChild(line);
		}
	}
}

function clickEvent(nervejs,arg) {
	if(arg>=0 || (nervejs.pan[0]==-1 && nervejs.pan[1]==-1)) {
		nervejs.pan[0]=nervejs.container.children[0].transform.baseVal[0].matrix.e;
		nervejs.pan[1]=nervejs.container.children[0].transform.baseVal[0].matrix.f;
	}

	if(nervejs.container.children[0].transform.baseVal[0].matrix.e!=nervejs.pan[0] || nervejs.container.children[0].transform.baseVal[0].matrix.f!=nervejs.pan[1]) {
		nervejs.pan[0]=nervejs.container.children[0].transform.baseVal[0].matrix.e;
		nervejs.pan[1]=nervejs.container.children[0].transform.baseVal[0].matrix.f;
		return;
	}

	if(nervejs.selected>=0) {
		nervejs.nodes[nervejs.selected].circle.children[0].style.strokeWidth="0px";
	}
	nervejs.selected=arg;
	nervejs.highlighted=-1;
	if(arg>=0) {
		nervejs.nodes[arg].circle.children[0].style.stroke="black";
		nervejs.nodes[arg].circle.children[0].style.strokeWidth="6px";
	}

	if (typeof node_select === 'function') {
		node_select(nervejs,nervejs.selected);
	}
}

function mouseoverEvent(nervejs,arg) {
	if (nervejs.highlighted!=-1) {
		nervejs.nodes[nervejs.highlighted].circle.children[0].style.stroke="black";
		nervejs.nodes[nervejs.highlighted].circle.children[0].style.strokeWidth="0px";
	}
	if (nervejs.selected!=arg) {
		nervejs.highlighted=arg;
		if(arg>=0) {
			nervejs.nodes[arg].circle.children[0].style.stroke="grey";
			nervejs.nodes[arg].circle.children[0].style.strokeWidth="5px";
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
	  defaults: {
			node: {
				colour: "black",
				box: [50,60],
				dims: [25,30],
				border: {
					colour: "black",
					thickness: 2,
				},
				padding: [0,0],
				radius: 10,
				visible: true,
			},
			edge: {
				colour: "black",
				thickness: 2,
				style: "solid",
				visible:  true,
			},
		}
	};

	container = document.createElementNS(svgns, "svg");
	container.setAttribute ("width", "100%");
	container.setAttribute ("height", "100%");
	container.setAttributeNS(null, 'style', 'padding: 0px;' );
	container.addEventListener('wheel', evt => evt.preventDefault());

	container.onclick = (function (nervejs,arg) {
				return function () {
					event.stopPropagation();
					clickEvent(nervejs,arg);
				};
			})(nervejs,-1);

	container.onmouseover = (function (nervejs,arg) {
				return function () {
					event.stopPropagation();
					mouseoverEvent(nervejs,arg);
				};
			})(nervejs,-1);

	nervejs.container=container;

	return nervejs;
}
