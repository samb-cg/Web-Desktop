class WebDesktop {
    constructor(desktop,launchersList,modalSpace,modalBtnList,taskbarList,newFoldIcons,newFoldBtn,delFoldBtn,clickAbleImgs,imgModal){
        this.desktop = desktop;
        this.launcherList = launchersList;
        this.modalSpace = modalSpace;
        this.modalBtnList = modalBtnList;
        this.taskbarList = taskbarList;
        this.newFoldIcons = newFoldIcons;
        this.newFoldBtn = newFoldBtn;
        this.delFoldBtn = delFoldBtn;
        this.clickAbleImgs = clickAbleImgs;
        this.imgModal = imgModal;
        this.imgModalSrc = imgModal.querySelector("#image-modal-src"); 

        // Configuration
        this.launcherWidth = 100;
        this.launcherHeight = 100;
        this.launcherPadding = 10;
        this.launcherXPos = this.launcherPadding;
        this.launcherYPos = this.launcherPadding;
        this.launcherGrid = {};
        this.posGrid = {};

        this.desktopHeight = this.desktop.clientHeight;
        this.desktopMargin = this.desktopHeight-this.launcherHeight*1.5; // Max Y height for launcher.

        this.isMouseDown = false;
        this.mouse = {x:0,y:0};
        this.mouseCount = 0;
        this.moveTarget;

        this.isDeleting = false;

        this.modalsOnTaskbar = [];
        
    }
    initGrid(){
        let realHeight = this.desktopMargin;
        let realWidth = this.desktop.clientWidth - ( this.launcherPadding * 2 );
        let gridCols = Math.ceil(realWidth / this.launcherWidth);
        let gridRows = Math.ceil(realHeight / this.launcherHeight);
        console.log("Cols : " + gridCols + " Rows : " + gridRows);
    
        let gridTotal = gridCols * gridRows;
        let curXPos = this.launcherPadding;
        let curYPos = this.launcherPadding;
        let rowCount = 0;
        for( let i = 0; i < gridTotal; i++ ){
            let tempObj = {};
            tempObj.x = curXPos;
            tempObj.y = curYPos;
            tempObj.taken = false;
            this.posGrid[ i ] = tempObj;
            curYPos += this.launcherHeight;
            rowCount++;
            if( rowCount == gridRows ){
                curXPos += this.launcherWidth;
                curYPos = this.launcherPadding;
                rowCount = 0;
            }
        }   
        console.log(this.posGrid);
        this.loopLauncherList();
    }
    loopLauncherList(){
        let launcherLength = this.launcherList.children.length;
        for( let i = 0; i < launcherLength; i++ ){
            let curLauncher = this.launcherList.children[ i ];
            this.addLauncherToGrid( curLauncher, i );
            this.setLauncherEvent( curLauncher );
        }
    }
    addLauncherToGrid( launcher, objIndex ){
        this.posGrid[ objIndex ].id = launcher.attributes.id.value;
        this.posGrid[ objIndex ].taken = true;
        launcher.style.left = this.posGrid[ objIndex ].x + "px";
        launcher.style.top = this.posGrid[ objIndex ].y + "px";
        launcher.style.width = this.launcherWidth + "px";
        launcher.style.height = this.launcherHeight + "px";
    }
    findSpotInGrid(){
        let emptySpot = false;
        let i = 0;
        while (!emptySpot) {

            let gridSpot = this.posGrid[ i ].taken;
            if(!gridSpot) emptySpot = i;

            i++;
        }
        return emptySpot;
    }

    init(){
        // Launchers and folders.
        //this.initLaunchers();
        this.setModalStyle();
        this.initModalBtns();
        this.initImgClick();
        this.initNewFoldIcons();
        this.initNewFolder();
        this.initDelFolder();

        // Drag functions.
        this.initMouseDown();
        this.initMouseUp();

        this.initGrid();
    }
    // When user clicks on a launcher
    handleDblClick( targetName ){
        let eT = document.getElementById( targetName );
        eT.style.display = "block";
    }
    // Place all the base launchers and add them to the launchergrid object.
    initLaunchers(){
        this.launcherGrid = {};
        let launcherCount = this.launcherList.children.length;

        for( let i = 0; i < launcherCount; i++ ){

           let curLauncher = this.launcherList.children[i];
           this.setLauncherEvent( curLauncher );

           this.setLauncherPos( curLauncher );

           this.setLauncherGrid( curLauncher );

        }

    }
    // Launcher onclick.
    setLauncherEvent( launcher ){
        let lTar = launcher.attributes.target.value;
        launcher.ondblclick = () => {
            this.handleDblClick( lTar );
        }
    }
    setLauncherPos( launcher ){
        if( this.launcherYPos > this.desktopMargin ){
            this.launcherXPos += this.launcherWidth;
            this.launcherYPos = this.launcherPadding;
        }
        launcher.style.top = this.launcherYPos + "px";
        launcher.style.left = this.launcherXPos + "px";
        launcher.style.width = this.launcherWidth + "px";
        launcher.style.height = this.launcherHeight + "px";
    }
    // Object that is used to store position off all launchers.
    setLauncherGrid( launcher ){

        let tempObj = {};
        tempObj.xPos = this.launcherXPos;
        tempObj.yPos = this.launcherYPos;
        this.launcherGrid[ launcher.attributes.id.value ] = tempObj;

        this.launcherYPos += this.launcherHeight;

    }
    setModalStyle(){
        this.modalCount = this.modalSpace.children.length;
        for( let i = 0; i < this.modalCount; i++ ){
            this.modalSpace.children[i].style.display = "none";
        }
    }
    // Get all modal button lists and process them.
    initModalBtns(){
        this.btnListCount = this.modalBtnList.length;
        for( let i =0; i < this.btnListCount; i++ ){

           this.setBtnEvents(this.modalBtnList[i]);
        
        }
    }
    // Events for the min, grow and close buttons of a modal folder.
    setBtnEvents(btnList){
        let minBtn = btnList.children[0];
        let growBtn = btnList.children[1];
        let closeBtn = btnList.children[2];
        let minTar = minBtn.attributes.target.value;
        let growTar = growBtn.attributes.target.value;
        let closeTar = closeBtn.attributes.target.value;
        minBtn.onclick = ()=>{
            this.minModal( minTar );
        }
        growBtn.onclick = () => {
            this.growModal( growTar );
        }
        closeBtn.onclick = () => {
            this.closeModal( closeTar );
        }
    }
    minModal( targetName ){
        let eT = document.getElementById(targetName);
        eT.style.display = "none";

        // Add to taskbar
        let modalIcon = document.getElementById(targetName+"-icon");
        this.addToTaskbar(targetName, modalIcon);
    };
    growModal( targetName ){
        let eT = document.getElementById(targetName);
        if( eT.style.width == "1200px" ){
            eT.style.width = "600px";
        } else {
            eT.style.width = "1200px";
        }
        eT.style.left = "auto";
    }
    closeModal( targetName ){
        let eT = document.getElementById( targetName );
        eT.style.display = "none";
        eT.style.left = "auto";
        eT.style.top = "auto";
        eT.style.zIndex = "1";

        this.removeFromTaskbar( targetName );
    }
    // When a modal is minimized, create a taskbar representation.
    addToTaskbar(modalName,modalIcon){
        if( this.modalsOnTaskbar.includes( modalName ) ) return;
        this.modalsOnTaskbar.push(modalName);

        // Remove "modal" from name.
        let name = modalName.slice( 0, ( modalName.length - 6 ) );

        let html = '<li class="nav-list-item" id="'+modalName+'-task" target="'+name+'">'+
        '<span class="txt-xl">'+modalIcon.innerHTML+'</span>'+
        '<span class="txt-l">'+name+'</span>'+
        '</li>';

        this.taskbarList.insertAdjacentHTML("beforeend",html);

        // Add onclick event to the new taskbar element.
        this.taskbarList.children[this.taskbarList.children.length-1].onclick = () => {
            this.handleDblClick( modalName );
        };
    }
    // When a modal is closed remove it from the taskbar if needed.
    removeFromTaskbar(name){
        if( !this.modalsOnTaskbar.includes( name ) ) return;
        let delIndex = this.modalsOnTaskbar.indexOf( name );
        this.modalsOnTaskbar.splice( delIndex, 1 );
        let eT = document.getElementById(name+"-task");
        eT.remove();
    }
    // Add onclick event to all clickable images. 
    initImgClick(){
        let imgCount = this.clickAbleImgs.length;
        for( let i = 0; i < imgCount; i++ ){

            let srcName = this.clickAbleImgs[i].attributes.src.value;

            this.clickAbleImgs[i].onclick = ()=>{
                this.handleImgClick(srcName);
            }
        }
    }
    // When an image is clicked, set the src of the image modal to the target src.
    handleImgClick(srcName){

        this.imgModalSrc.attributes.src.value = srcName;

        this.imgModal.style.display = "block";

    }
    initNewFoldIcons(){
        let l = this.newFoldIcons.children.length;
        for( let i = 0; i < l; i++ ){
            this.newFoldIcons.children[i].onclick = ( e ) =>{
                this.newFoldIconHandler( e );
            }
        }
    }
    // When an icon in the "create new folder" modal is pressed set its class to active.
    newFoldIconHandler( e ){
        let l = this.newFoldIcons.children.length;
        for( let i = 0; i < l; i++ ){
            this.newFoldIcons.children[i].classList.remove("active");
        }
        e.target.classList.add("active");
    }
    // When create folder button is pressed.
    initNewFolder(){
        this.newFoldBtn.onclick = () => {
            let newName = document.getElementById("folderName");

            if( !newName.reportValidity() ) return;
            newName = newName.value;

            let iconList = document.getElementById("newFoldIcons");
            let activeIcon;
            let l = iconList.children.length;
            for( let i = 0; i < l; i++ ){
                if( iconList.children[i].classList.contains("active") ) activeIcon = iconList.children[i];
            }
            activeIcon = activeIcon.innerHTML;

            this.createModal( newName );
            this.createLauncher( newName, activeIcon );

        }
    }
    // Create the modal part.
    createModal( name ){

        let html = 
        "<div class='modal' id='"+name+"-modal' style='display: none;'>"+
            "<div class='modal-header'>"+
                "<div class='modal-title row justify-center dragAble' target='"+name+"-modal' type='folder'>"+
                    "<span class='col justify-center ml-2'>"+name+
                    "</span>"+
                "</div>"+
                "<div class='row justify-center modal-btn-list'>"+
                    "<button type='button' class='modal-min-btn' target='"+name+"-modal'>"+
                        "&minus;"+
                    "</button>"+
                    "<button type='button' class='modal-grow-btn' target='"+name+"-modal'>"+
                        "&#9713;"+
                    "</button>"+
                    "<button type='button' class='modal-close-btn' target='"+name+"-modal'>"+
                        "&times;"+
                    "</button>"+
                "</div>"+
            "</div>"+
            "<div class='modal-body'>"+
            "</div>"+
        "</div>";


        this.modalSpace.insertAdjacentHTML("beforeend",html);

        let newModal = this.modalSpace.children[ this.modalSpace.children.length-1 ];
        let newBtnList = newModal.children[0].children[1];
        this.setBtnEvents( newBtnList );
    }
    // Create the launcher part.
    createLauncher( name, icon ){

        let html = 
        "<li class='launcher-list-item dragAble' deleteAble='true' target='"+name+"-modal'"+
        "type='launcher' id='"+name+"Launcher' style='width: 100px; height: 100px;' >"+
            "<span class='desktop-icon' id='"+name+"-modal-icon'>"+
                icon+
            "</span>"+
            "<span class='desktop-icon-txt'>"+
                name+
            "</span>"+
        "</li>";

        this.launcherList.insertAdjacentHTML( "beforeend", html );

        let newLauncher = this.launcherList.children[ this.launcherList.children.length-1 ];

        this.setLauncherEvent( newLauncher );
        this.setLauncherPos( newLauncher );
        this.setLauncherGrid( newLauncher );

    }
    // Delete folder launcher onclick.
    // Have to use .bind function to be able to later remove the event listener.
    initDelFolder(){

        this.delFoldBtn.addEventListener( "dblclick", ()=>{
            this.isDeleting = true;
            this.boundEventHandler = this.eventHandler.bind(this);
            this.desktop.addEventListener( "click", this.boundEventHandler );
        });

    }
    eventHandler(elem){
        let t = document.getElementById("desktop");
        t.removeEventListener("click", this.boundEventHandler);
        this.closeDelFolder(elem);
    }
    closeDelFolder(e){
        this.closeModal("delFolder-modal");
        let canDelete = e.target.attributes.deleteAble;
        this.isDeleting = false;
        if(!canDelete)return;
        this.removeElem(e);
    }
    removeElem( e ){
        let delTar = e.target.attributes.target.value;
        document.getElementById(delTar).remove();
        e.target.remove();
        this.removeFromGrid( e );
    }
    removeFromGrid(e){
        delete this.launcherGrid[e.target.attributes.id.value];
        this.resetLauncherPos();
    }
    resetLauncherPos(){
        let xH = 0;
        let yH = 0;
        let l = Object.keys(this.launcherGrid).length;
        for( let i = 0; i < l; i++ ){
            let curXPos = Object.values(this.launcherGrid)[i].xPos;
            let curYPos = Object.values(this.launcherGrid)[i].yPos;
            if( curXPos > xH ) xH = curXPos;
            if( curXPos >= xH && curYPos > yH ) yH = curYPos;
        }
        this.launcherXPos = xH;
        this.launcherYPos = yH;
    }
    // When the mouse is down and the target is drag-able, add mousemove event to the desktop element.
    initMouseDown(){
        document.onmousedown = ( e ) => {
            let eC = e.target.classList;
            if(!eC.contains("dragAble"))return;
            let eT = e.target.attributes.type.value;
            eT == "launcher" ? this.moveTarget = e.target 
            : this.moveTarget = document.getElementById( e.target.attributes.target.value ); 
            this.isMouseDown = true;
            this.moveTarget.style.zIndex = "4";
            this.mouseBind = this.setMousePos.bind( this );
            this.desktop.addEventListener( "mousemove", this.mouseBind);
        } 
    }
    setMousePos( e ){
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        if( this.isMouseDown && !this.isDeleting ) {
            this.mouseCount++;
            let tarHeight;
            let tarWidth = this.moveTarget.clientWidth / 2;
            let isLauncher = this.moveTarget.classList.contains("launcher-list-item");
            isLauncher ? tarHeight = this.moveTarget.clientHeight / 2 
            : tarHeight = this.moveTarget.children[0].clientHeight / 2;
            this.moveTarget.style.left = this.mouse.x - tarWidth + "px";
            this.moveTarget.style.top = this.mouse.y - tarHeight + "px";
        } 
    }
    // On mouse up check if the last target was a launcher, if so, call the according function
    // to "snap" the launcher in a grid like way.
    initMouseUp(){
        document.onmouseup = ( e ) => {
            if( !this.moveTarget ) return;
            this.desktop.removeEventListener( "mousemove", this.mouseBind );
            if( this.moveTarget.classList.contains("launcher-list-item"))this.launcherMouseUp();
            this.isMouseDown = false;
            this.moveTarget = 0;
            this.mouseCount = 0;
        }
    }
    // Launcher has collided or mouse went up too soon.
    launcherToOldPos( oldI ){
        let oldX = this.posGrid[ oldI ].x;
        let oldY = this.posGrid[ oldI ].y;
        this.moveTarget.style.left = oldX+"px";
        this.moveTarget.style.top = oldY+"px";
    }
    launcherToNewPos( x, y, newI, oldI ){
        this.moveTarget.style.left = x +"px";
        this.moveTarget.style.top = y +"px";
        // Update grid info.
        this.posGrid[ newI ].taken = true;
        this.posGrid[ oldI ].taken = false;
    }
    getOldPos( id ){
        let l = Object.keys(this.posGrid).length;
        let oldI;
        for( let i = 0; i < l; i++ ){
            if( this.posGrid[i].id == id ){
                oldI = i;
                break;
            }
        }
        return oldI;
    }
    // Calculate the position a launcher is closest to in the grid.
    launcherMouseUp(){
        let oldI = this.getOldPos( this.moveTarget.attributes.id.value );
        if(this.mouseCount < 10){
            return;
        }
        let curXPos = Math.ceil(this.mouse.x/this.launcherWidth);
        let curYPos = Math.ceil(this.mouse.y/this.launcherHeight);
        let tarXPos = (curXPos-1)*this.launcherWidth+this.launcherPadding;
        let tarYPos = (curYPos-1)*this.launcherHeight+this.launcherPadding;
    

        let collision = false;
        let newI = this.getObjIndex(tarXPos, tarYPos);
        if( this.posGrid[ newI ].taken ) collision = true;

        if(collision){ // Collision
            this.launcherToOldPos( oldI );
        }else{ // No collision
            this.launcherToNewPos( tarXPos, tarYPos, newI, oldI );
        }
        
        this.moveTarget.style.zIndex = "2";
        this.isMouseDown = false;
    }
    getObjIndex( x, y ){
        let w = this.desktop.clientWidth - (this.launcherPadding * 2);
        let h = this.desktopMargin;
        
        let tarCol = ( x -this.launcherPadding ) / this.launcherWidth; 

        let totalRows = Math.ceil( h / this.launcherHeight );

        let objIndex = totalRows * tarCol;
        objIndex += ( y-this.launcherPadding ) / this.launcherHeight;

        return objIndex;
    }
    // Check if a launcher is being placed on another launcher.
    collisionCheck( xPos, yPos ){
        let collision = false;
        let gridL = Object.keys(this.launcherGrid).length;
        for (let i = 0; i <  gridL; i++) {

            let takenXpos = Object.values(this.launcherGrid)[i].xPos;
            let takenYpos = Object.values(this.launcherGrid)[i].yPos;
    
            if(xPos == takenXpos && yPos == takenYpos) {
                collision = true;
            }
        }
        return collision;
    }

}
export {WebDesktop};