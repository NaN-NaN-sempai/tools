defaultMetalomSize = 2;

displayWood = true;
echoMetalom = true;

if(echoMetalom)
echo("\n\n\n\nMETALOMLIST:\n");

module metalom(w = defaultMetalomSize, h = defaultMetalomSize, l = 10, r = v0) {
    if(echoMetalom)
    echo(str("met. ",w, " x ", h, " => ", l));
    
    rotate(r)
    cube([w,h,l]);
}

module prateleira(w = 10, l = 10, h = 2, re = true,
    mFront = true,
    mBack = true,
    mRight = true,
    mLeft = true,
    
    wood = true,
){
    
    mw = re? w-4: w;
    ml = re? l-4: l;
    
    offw = re? [2,0]: v0;
    offw2 = re? [2,4]: v0;
    offl = re? [0,2]: v0;
    
    color("black"){
        if(mBack)
        translate(offw)
        rotate([90,0, 90])        
        metalom(l=mw);
        
        if(mFront)
        translate([0,ml-2] + offw2)
        rotate([90,0, 90])        
        metalom(l=mw);
        
        if(mRight)
        translate([2,0] + offl)
        rotate([90,0, 180])
        metalom(l=ml);
        
        if(mLeft)
        translate([w,0] + offl)
        rotate([90,0, 180])
        metalom(l=ml);
    }
    
    if(echoMetalom && wood)
    echo(str("mad. ",w-4," x ",l-4, " x ", h));
    
    if(displayWood && wood)
    color("#ffc18c")
    translate([2,2])
    cube([w-4,l-4,h]);
}
