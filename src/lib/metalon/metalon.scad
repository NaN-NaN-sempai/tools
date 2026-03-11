 v0 = [0,0,0];
 vx = [1,0,0];
 vy = [0,1,0];
 vz = [0,0,1];
vxy = [1,1,0];
vyx = vxy;
vxz = [1,0,1];
vzx = vxz;
vyz = [0,1,1];
vzy = vyz;
 va = [1,1,1];

function rotate_vector(v, axis, ang) =
    v*cos(ang) +
    cross(axis, v)*sin(ang) +
    axis*(axis*v)*(1-cos(ang));
    
function rotateVector(v, axis, ang) =
    let(a = axis / norm(axis))
        v*cos(ang) +
        cross(a, v)*sin(ang) +
        a*(a*v)*(1-cos(ang));
        
function normalize2D(v) =
    let(len = sqrt(v[0]*v[0] + v[1]*v[1]))
    len == 0 ? [0,0] : [v[0]/len, v[1]/len];
    
function rayRectDistance(p, v, size) =
    let(
        sx = v[0] > 0 ? (size[0] - p[0]) / v[0] :
             v[0] < 0 ? (0 - p[0]) / v[0] :
             undef,

        sy = v[1] > 0 ? (size[1] - p[1]) / v[1] :
             v[1] < 0 ? (0 - p[1]) / v[1] :
             undef,

        s = [
            if (sx != undef && sx >= 0) sx,
            if (sy != undef && sy >= 0) sy
        ]
    )
    len(s) ? min(s) : undef;
    
function clamp(x, a, b) = min(max(x, a), b);

function angleBetween(v1, v2) =
    let(
        mag1 = norm(v1),
        mag2 = norm(v2)
    )
    (mag1 == 0 || mag2 == 0)
        ? undef
        : acos(clamp((v1 * v2) / (mag1 * mag2), -1, 1));

module line(
        p1=[0,0,0], p2=[0,0,0], w=.5
    ) {
    v = p2 - p1;
        
    dist = norm(v);

    if (dist > 0) {
        dir = v / dist;
        axis = cross([0,0,1], dir);
        axis_len = norm(axis);
        angle = acos(dir[2]);

        translate(p1)
        rotate(
            a = angle,
            v = axis_len == 0 ? [1,0,0] : axis
        )
        translate([-w/2, -w/2, 0])   // centraliza
            cube([w, w, dist]);
    }
}



showRulers = true;
function showRulersFunc (bool = true) =
    showRulers;

module ruler( p1=[0,0,0], p2=[0,0,0],


        spacing = 1.5,

        textRotation = 180,
        lineRotation = 90,
        rotation,

        rulerColor = [0,0,0,.3],
        textColor = [0,0,0,.3],
        objColor,

        textOffset=v0,

        textSize = 1.5,
        width = .5,
        name = "",
    ){
      
    textRotation = rotation? rotation : textRotation;
    lineRotation = rotation? rotation : lineRotation;
    
    textColor = objColor ? objColor : textColor;
    rulerColor = objColor ? objColor : rulerColor;
    
    v = p2 - p1;
    dist = norm(v);

    dir = v / dist;
    
    mid = (p1 + p2) / 2;
    
    vnorm = (p2 - p1) / norm(p2 - p1);
    prePerp = norm(cross(vnorm,[0,0,1])) > 0
        ? cross(vnorm,[0,0,1])
        : cross(vnorm,[1,0,0]);
    perp = prePerp / norm(prePerp);
    perpRot = rotate_vector(perp, dir, lineRotation);
    space = perpRot*spacing;
    textPos = mid - perpRot*(spacing/2);
    
    if(showRulersFunc()) {
        
        // text
        translate(textPos)
        translate(textOffset)
        rotate([90,0,-textRotation])
        color(textColor)
        linear_extrude(height=0.2){
            text(str(round(dist*1000)/1000),
            size=textSize,
            halign="right");
            
            if(name)
            translate([0,textSize+2])
            text(name, size=textSize, halign="right");
        }
        
        color(rulerColor)
         union(){
            
            // guides
            line(p1 - space, p1 + space,width);
            
            line(p2 - space, p2 + space,width);
            
            // main line
            line(p1,p2,width);
         }
    }
}




defaultMetalomSize = 2;

displayWood = true;
echoMetalom = true;

defaultMetalomColor = "black";
defaultMadeiraColor = "#ffc18c";

if(echoMetalom)
echo("\n\n\n\nMETALOMLIST:\n");

module titulo(txt)
    echo(str("title.", txt));

module metalom(w = defaultMetalomSize, h = defaultMetalomSize,
    m,
    l = 10, r = v0) {

    if(echoMetalom)
    echo(str("met. ",w*10, " x ", h*10, " => ", l));
    
    rotate(r)
    color(defaultMetalomColor)
    cube([w,h,l]);
}

module madeira(
    w = 10, l = 10, h=2,
    wood = true,
    h = 2,
    c=defaultMadeiraColor,
) {
    if(echoMetalom && wood)
    echo(str("mad. ",w," x ",l, " x ", h));
    
    if(displayWood && wood)
    color(c)
    cube([w,l,h]);
}

module prateleira(w = 10, l = 10, h = 2, re = true,
    mFront = true,
    mBack = true,
    mRight = true,
    mLeft = true,

    noFrame = false,

    mtype = [2,2],
    
    wood = true,
    woodColor = defaultMadeiraColor,
){
    mFront = noFrame? false: mFront;
    mBack = noFrame? false: mBack;
    mRight = noFrame? false: mRight;
    mLeft = noFrame? false: mLeft;
    
    mw = re? w-(mtype[0]*2): w;
    ml = re? l-(mtype[0]*2): l;
    
    mwid = mtype[0];
    mhei = mtype[1]? mtype[1]: mtype[0];
    
    offw = re? [mwid,0]: [0,0];
    offw2 = re? [mwid,mwid*2]: [0,0];
    offl = re? [0, mwid]: [0, 0];
    
    if(mBack)
    translate(offw)
    rotate([90,0, 90])        
    metalom(w=mwid, h=mhei, l=mw);
    
    if(mFront)
    translate([0,ml-mwid] + offw2)
    rotate([90,0, 90])        
    metalom(w=mwid, h=mhei, l=mw);
    
    if(mRight)
    translate([mwid,0] + offl)
    rotate([90,0, 180])
    metalom(w=mwid, h=mhei, l=ml);
    
    if(mLeft)
    translate([w,0] + offl)
    rotate([90,0, 180])
    metalom(w=mwid, h=mhei, l=ml);


    madSizes = [w-(mwid*2), l-(mwid*2), h];
    
    translate([mwid,mwid])
    madeira(madSizes[0], madSizes[1], madSizes[2],
        wood=wood,
        c=woodColor,
    );
}



module rodinha(
    rodaS = 1.5,
    rodaR = 5,
    supS = 2,
    supC = "black",
    h,
    w,

) {

    ratio = 1/6;

    rodaR = h? h * ratio * 5: rodaR;
    supS = h? h * ratio: supS;

    rodaS = w? w/3: rodaS;

    module roda(s = 2, r = 2) {
        color("#8dffeed3") 
        rotate(vy*90) 
        cylinder(s, r = r/2, $fn = 40);
    }

    translate([-rodaS * 1.5, 0, (-rodaR/2) - supS]) {
        
        translate((vx * -.01)) 
        roda(rodaS, rodaR);

        translate(vx * (rodaS * 2) + (vx * .01)) 
        roda(rodaS, rodaR);


        translate(vx * rodaS - vy * (rodaS / 2)) 
        color(supC)
        cube([rodaS, rodaS, rodaR/2]); 

        translate(vx * rodaS - vy * (rodaS / 2) + vz * (rodaR / 2)) 
        color(supC)
        cube([rodaS, rodaS, supS]); 
    } 
}