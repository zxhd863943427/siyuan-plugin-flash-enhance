<template>
        <div class="fn__flex b3-label" style="justify-content: end;">
            <button
            @:click="addOcclusion"
            class="b3-button b3-button--outline fn__flex-center fn__size96"><svg class="b3-menu__icon" style=""><use xlink:href="#iconAdd"></use></svg>
    </button>
    <span style="width: 10px;"></span>
    <button @:click="deleteOcclusion"
                class="b3-button b3-button--outline fn__flex-center fn__size96"><svg class="b3-menu__icon" style=""><use xlink:href="#iconTrashcan"></use></svg>
    </button>
    <span style="width: 10px;"></span>
    <span style="margin-top: auto;margin-bottom: auto;"> Cloze Id:</span>
    <select
        v-model="cidSelectorRef"
        @:change="onCIdChange"
        style= "margin: 0; width: 80px;"
    >
    <option v-for="n in 9">{{ n }}</option>
    </select>

    </div>
    <div id="image-occlusion-main-canvas">
        <canvas ref="canvasRef"></canvas>
    </div>
    
</template>

<script lang="ts" setup>
type Occasion = {
    "left":number,
    "top":number,
    "width":number,
    "height":number,
    "angle":number,
    "cId":number}
const props = defineProps({
    imgSrc:String,
    occlusionData:Array<Occasion>
})
const emit = defineEmits(['destory','response'])
import {fabric} from "fabric"
import { ref, onMounted, onUnmounted, watch, emit } from "vue";
const MaxWidth = 1200
const MaxHeight = 600

let canvasRef = ref(null)
let cidSelectorRef = ref(1)
let fabricSelection = ref(null)

let fabricRef: fabric.Canvas
let imgEl = new Image()
imgEl.src = props.imgSrc

async function initFabric(){
    fabricRef = new fabric.Canvas(canvasRef.value, { 
        stateful: true,
        selection:false,
        uniformScaling:false })

    imgEl.onload=(e)=>{
        const img = new fabric.Image(imgEl)
        const canvasWidth = Math.min(
                        imgEl.width,
                        MaxWidth
                    );
        const canvasHeight = Math.min(
                        imgEl.height,
                        MaxHeight
                    );
        const scale = Number(
                        Math.min(
                            canvasWidth / imgEl.width,
                            canvasHeight / imgEl.height,
                        ).toPrecision(1),
                    );
        fabricRef.setZoom(scale);
        fabricRef.setWidth(imgEl.width * scale);
        fabricRef.setHeight(imgEl.height * scale);
        fabricRef.setBackgroundImage(
            img,
            fabricRef.renderAll.bind(fabricRef),
            {
                scaleX: 1,
                scaleY: 1,
            },
        );
        if (!(props.occlusionData instanceof Array)) 
            return;
        props.occlusionData.forEach((obj) => {
                        const occlusionEl = createOcclusionRectEl(
                            obj.left,
                            obj.top,
                            obj.width,
                            obj.height,
                            obj.angle,
                            obj.cId,
                        );
                        fabricRef.add(occlusionEl);
                    });
        fabricRef.renderAll();
        
    }
    
}

let downPoint:undefined|fabric.Point;
let upPoint:undefined|fabric.Point;
function canvasMouseDown(e:fabric.IEvent){
    downPoint=e.pointer
}
function canvasMouseup(e:fabric.IEvent){
    let activeObject = fabricRef.getActiveObject()
    console.log(activeObject)
    if (activeObject != null && activeObject != undefined)
        return
    upPoint=e.pointer
    if (upPoint===undefined || downPoint ===undefined)
        return
    let width = Math.abs(downPoint.x - upPoint.x)
    let height = Math.abs(downPoint.y - upPoint.y)
    let canvas = canvasRef.value
    if (canvas === null) 
        return;
    let canvasRect = canvas.getBoundingClientRect()
    if (width < 0.05 * canvasRect.width && height < 0.05 * canvasRect.height){
        return
    }
    let top = Math.min(downPoint.y, upPoint.y) + 0.5 * height
    let left = Math.min(downPoint.x, upPoint.x) + 0.5 * width

    let angle = 0
    let cId = cidSelectorRef.value
    const occlusionEl = createOcclusionRectEl(left,top,width,height,angle,cId)
    fabricRef.add(occlusionEl);
    fabricRef.setActiveObject(occlusionEl);
    fabricRef.renderAll();
}

function initDrawFree(){
    fabricRef.selection = true
    fabricRef.selectionColor = 'rgba(255, 235, 162, 0.2)' // 选框填充色：透明
    fabricRef.selectionBorderColor = 'rgba(0, 0, 0, 0.3)' 

    fabricRef.on("mouse:down",canvasMouseDown)
    fabricRef.on("mouse:up",canvasMouseup)
}

const disposeFabric = () => {
                fabricRef.dispose();
            };
//获得当前选中的元素
function initFabricEventListener(){
    fabricRef.on("selection:created",()=>{
        fabricSelection.value = fabricRef.getActiveObject()
        console.log(fabricRef.getActiveObject())
    })
    fabricRef.on("selection:updated",()=>{
        fabricSelection.value = fabricRef.getActiveObject()
        console.log(fabricRef.getActiveObject())
        
    })
    fabricRef.on("selection:cleared",()=>{
        fabricSelection.value = fabricRef.getActiveObject()
        console.log(fabricRef.getActiveObject())
    })
    console.log(fabricRef.getActiveObject())
}
//防止选中元素越界
function initPreventOutOfBounds(){
    const preventOutOfBounds = (e: any) => {
        const obj = e.target;
        const top = obj.top;
        const bottom = top + obj.height * obj.scaleY;
        const left = obj.left;
        const right = left + obj.width * obj.scaleX;

        const topBound = (obj.height * obj.scaleY) / 2;
        const bottomBound = topBound + imgEl.height;
        const leftBound = (obj.width * obj.scaleX) / 2;
        const rightBound = leftBound + imgEl.width;

        // capping logic here
        obj.left = Math.min(
            Math.max(left, leftBound),
            rightBound - obj.width * obj.scaleX,
        );
        obj.top = Math.min(
            Math.max(top, topBound),
            bottomBound - obj.height * obj.scaleY,
        );
    };
    fabricRef.on("object:moving", preventOutOfBounds);
    fabricRef.on("object:modified", preventOutOfBounds);
}

function getNewOcclusionData(){
    const occlusionArr:Occasion[] = [];
    fabricRef.getObjects().forEach((obj) => {
        occlusionArr.push({
            left: obj.left,
            top: obj.top,
            width: obj.getScaledWidth(),
            height: obj.getScaledHeight(),
            angle: obj.angle,
            cId: parseInt(obj._objects[1].text),
        });
    });
    return occlusionArr
}



//选中元素更新后更新cid
function updateCid(){
    if (fabricSelection.value != null)
    cidSelectorRef.value = fabricSelection.value._objects[1].text;
    // console.log(cidSelectorRef)
}

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && fabricRef.getActiveObject()) {
        fabricRef.discardActiveObject();
        fabricRef.renderAll();
        e.stopImmediatePropagation();
    }
    if (e.key === "Delete" && fabricRef.getActiveObject()) {
        deleteOcclusion();
        e.stopImmediatePropagation();
    }
    if (e.key === "Insert") {
        addOcclusion();
        e.stopImmediatePropagation();
    }
    if (e.key === "ArrowUp") {
        if (fabricRef.getActiveObject()) {
            fabricRef.getActiveObject().top -= 1;
            fabricRef.renderAll();
            e.stopImmediatePropagation();
        }
    }
    if (e.key === "ArrowDown") {
        if (fabricRef.getActiveObject()) {
            fabricRef.getActiveObject().top += 1;
            fabricRef.renderAll();
            e.stopImmediatePropagation();
        }
    }
    if (e.key === "ArrowLeft") {
        if (fabricRef.getActiveObject()) {
            fabricRef.getActiveObject().left -= 1;
            fabricRef.renderAll();
            e.stopImmediatePropagation();
        }
    }
    if (e.key === "ArrowRight") {
        if (fabricRef.getActiveObject()) {
            fabricRef.getActiveObject().left += 1;
            fabricRef.renderAll();
            e.stopImmediatePropagation();
        }
    }
    if (e.key >= "1" && e.key <= "9") {
        if (fabricRef.getActiveObject()) {
            cidSelectorRef.value = e.key;
            onCIdChange()
            e.stopImmediatePropagation();
        }
    }
};

function initEmitEvent(){
    emit("response",fabricRef)
    emit("destory",()=>{
        document.body.removeEventListener("keydown",onKeydown,{
        capture: true,
    })
    })
}

watch(fabricSelection,updateCid)
let mouseX,mouseY,isInCanvas
function initMouseListener(){
    // console.log(canvasRef.value)
    let canvas = canvasRef.value
    let {width, height} = canvas.getBoundingClientRect()
    canvasRef.value.parentElement.addEventListener("mousemove",(e)=>{
        mouseX = e.offsetX
        mouseY = e.offsetY
        let {width, height} = canvas.getBoundingClientRect()
        isInCanvas = mouseX > 0.03 * width && width - mouseX > 0.03 * width  && mouseY > 0.03 * height && height - mouseY  > 0.03 * height
        // console.log(mouseX,mouseY,isInCanvas)
    })
}
function getMiddle(a, b, c) {
  let nums = [a, b, c].sort((x, y) => x - y);
  return nums[1];
}
const addOcclusion = () => {

    let randomLocation
    let scale = fabricRef.getZoom()
    if (isInCanvas === true) {
        randomLocation = {
            x: getMiddle(0.11 * imgEl.width, mouseX / scale, imgEl.width - 0.11 * imgEl.width),
            y: getMiddle(0.11 * imgEl.height, mouseY / scale, imgEl.height - 0.11 * imgEl.height),
        };
    }
    else {
        randomLocation = {
            x:
                Math.floor(
                    Math.random() * (imgEl.width - 0.22 * imgEl.width),
                ) +
                0.11 * imgEl.width,
            y:
                Math.floor(
                    Math.random() * (imgEl.height - 0.22 * imgEl.height),
                ) +
                0.11 * imgEl.height,
        };
    }
    const occlusionEl = createOcclusionRectEl(
        randomLocation.x,
        randomLocation.y,
        0.22 * imgEl.width,
        0.22 * imgEl.height,
        0,
        cidSelectorRef.value
    );
    fabricRef.add(occlusionEl);
    fabricRef.setActiveObject(occlusionEl);
    fabricRef.renderAll();
};
const deleteOcclusion = () => {
    let activeObjectList = fabricRef.getActiveObjects()
    if (activeObjectList === null || activeObjectList === undefined)
        return;
    activeObjectList.forEach((activeObject:fabric.Object)=>{
        fabricRef.remove(activeObject)
    })
    // fabricRef.remove(fabricRef.getActiveObject());
    fabricRef.discardActiveObject()
    fabricRef.renderAll();
};
const onCIdChange = () => {
    if (fabricSelection.value != null) {
        fabricRef
            .getActiveObject()
            ._objects[1].set("text", cidSelectorRef.value);
        fabricRef.renderAll();
    }
};

onMounted(()=>{
    initFabric()
    // console.log("init fabric")
    initFabricEventListener()
    initPreventOutOfBounds()
    initEmitEvent()
    initMouseListener()
    initDrawFree()
    document.body.addEventListener("keydown",onKeydown,{
                capture: true,
            })
})

onUnmounted(()=>{
    console.log("unmounted vue")
})

// const OcclusionEditorComponent = React.forwardRef<any, any>(
//     ({ imgURL, occlusionArr }, fabricRef: any) => {
//         const canvasRef = React.useRef(null);
//         const cidSelectorRef = React.useRef(null);
//         const [imgEl, setImgEl] = React.useState(new window.parent.Image());

//         React.useEffect(() => {
//             const initFabric = async () => {
//                 fabricRef.current = new window.parent.fabric.Canvas(
//                     canvasRef.current,
//                     { stateful: true },
//                 );
//                 fabricRef.current.selection = false; // disable group selection
//                 fabricRef.current.uniformScaling = false; // disable object scaling keeping aspect ratio

//                 // Load the image and then add the occlusion rectangles
//                 imgEl.setAttribute("crossOrigin", "anonymous");
//                 const graphPath = (await logseq.App.getCurrentGraph()).path;
//                 imgEl.src = isWebURL_REGEXP.test(imgURL)
//                     ? imgURL
//                     : encodeURI(path.join(graphPath, path.resolve(imgURL)));
//                 imgEl.onload = function () {
//                     const img = new window.parent.fabric.Image(imgEl);
//                     const canvasWidth = Math.min(
//                         imgEl.width,
//                         window.parent.document.querySelector(
//                             ".occlusion__editor",
//                         ).clientWidth - 160,
//                     );
//                     const canvasHeight = Math.min(
//                         imgEl.height,
//                         window.parent.document.body.clientHeight - 340,
//                     );
//                     const scale = Number(
//                         Math.min(
//                             canvasWidth / imgEl.width,
//                             canvasHeight / imgEl.height,
//                         ).toPrecision(1),
//                     );
//                     fabricRef.current.setZoom(scale);
//                     fabricRef.current.setWidth(imgEl.width * scale);
//                     fabricRef.current.setHeight(imgEl.height * scale);
//                     fabricRef.current.setBackgroundImage(
//                         img,
//                         fabricRef.current.renderAll.bind(fabricRef.current),
//                         {
//                             scaleX: 1,
//                             scaleY: 1,
//                         },
//                     );
//                     fabricRef.current.renderAll();

//                     occlusionArr.forEach((obj) => {
//                         const occlusionEl = createOcclusionRectEl(
//                             obj.left,
//                             obj.top,
//                             obj.width,
//                             obj.height,
//                             obj.angle,
//                             obj.cId,
//                         );
//                         fabricRef.current.add(occlusionEl);
//                     });
//                     fabricRef.current.renderAll();
//                 };
//             };
//             const disposeFabric = () => {
//                 fabricRef.current.dispose();
//             };
//             initFabric();
//             return () => {
//                 disposeFabric();
//             };
//         }, []);

//         // Handle Selection
//         const [fabricSelection, setFabricSelection] = React.useState(null);
//         React.useEffect(() => {
//             fabricRef.current.on("selection:created", function () {
//                 setFabricSelection(fabricRef.current.getActiveObject());
//             });
//             fabricRef.current.on("selection:updated", function () {
//                 setFabricSelection(fabricRef.current.getActiveObject());
//             });
//             fabricRef.current.on("selection:cleared", function () {
//                 setFabricSelection(null);
//             });
//         }, [fabricRef]);
//         React.useEffect(() => {
//             if (fabricSelection) {
//                 cidSelectorRef.current.value = fabricSelection._objects[1].text;
//             }
//         }, [fabricSelection]);

//         // Prevent out of bounds - https://stackoverflow.com/a/42915768
//         React.useEffect(() => {
//             const preventOutOfBounds = (e: any) => {
//                 const obj = e.target;
//                 const top = obj.top;
//                 const bottom = top + obj.height * obj.scaleY;
//                 const left = obj.left;
//                 const right = left + obj.width * obj.scaleX;

//                 const topBound = (obj.height * obj.scaleY) / 2;
//                 const bottomBound = topBound + imgEl.height;
//                 const leftBound = (obj.width * obj.scaleX) / 2;
//                 const rightBound = leftBound + imgEl.width;

//                 // capping logic here
//                 obj.left = Math.min(
//                     Math.max(left, leftBound),
//                     rightBound - obj.width * obj.scaleX,
//                 );
//                 obj.top = Math.min(
//                     Math.max(top, topBound),
//                     bottomBound - obj.height * obj.scaleY,
//                 );
//             };
//             fabricRef.current.on("object:moving", preventOutOfBounds);
//             fabricRef.current.on("object:modified", preventOutOfBounds);
//         }, [fabricRef]);

//         // Handle some key events
//         React.useEffect(() => {
//             const onKeydown = (e: KeyboardEvent) => {
//                 if (e.key === "Escape" && fabricRef.current.getActiveObject()) {
//                     fabricRef.current.discardActiveObject();
//                     fabricRef.current.renderAll();
//                     e.stopImmediatePropagation();
//                 }
//                 if (e.key === "Delete" && fabricRef.current.getActiveObject()) {
//                     deleteOcclusion();
//                     e.stopImmediatePropagation();
//                 }
//                 if (e.key === "Insert") {
//                     addOcclusion();
//                     e.stopImmediatePropagation();
//                 }
//                 if (e.key === "ArrowUp") {
//                     if (fabricRef.current.getActiveObject()) {
//                         fabricRef.current.getActiveObject().top -= 1;
//                         fabricRef.current.renderAll();
//                         e.stopImmediatePropagation();
//                     }
//                 }
//                 if (e.key === "ArrowDown") {
//                     if (fabricRef.current.getActiveObject()) {
//                         fabricRef.current.getActiveObject().top += 1;
//                         fabricRef.current.renderAll();
//                         e.stopImmediatePropagation();
//                     }
//                 }
//                 if (e.key === "ArrowLeft") {
//                     if (fabricRef.current.getActiveObject()) {
//                         fabricRef.current.getActiveObject().left -= 1;
//                         fabricRef.current.renderAll();
//                         e.stopImmediatePropagation();
//                     }
//                 }
//                 if (e.key === "ArrowRight") {
//                     if (fabricRef.current.getActiveObject()) {
//                         fabricRef.current.getActiveObject().left += 1;
//                         fabricRef.current.renderAll();
//                         e.stopImmediatePropagation();
//                     }
//                 }
//                 if (e.key >= "1" && e.key <= "9") {
//                     if (fabricRef.current.getActiveObject()) {
//                         cidSelectorRef.current.value = e.key;
//                         const event = new Event("change", { bubbles: true });
//                         cidSelectorRef.current.dispatchEvent(event);
//                         e.stopImmediatePropagation();
//                     }
//                 }
//             };
//             window.parent.document.addEventListener("keydown", onKeydown, {
//                 capture: true,
//             });
//             return () => {
//                 window.parent.document.removeEventListener(
//                     "keydown",
//                     onKeydown,
//                     { capture: true },
//                 );
//             };
//         }, [fabricRef]);

//         // Create the UI
//         const addOcclusion = () => {
//             const randomLocation = {
//                 x:
//                     Math.floor(
//                         Math.random() * (imgEl.width - 0.22 * imgEl.width),
//                     ) +
//                     0.11 * imgEl.width,
//                 y:
//                     Math.floor(
//                         Math.random() * (imgEl.height - 0.22 * imgEl.height),
//                     ) +
//                     0.11 * imgEl.height,
//             };
//             const occlusionEl = createOcclusionRectEl(
//                 randomLocation.x,
//                 randomLocation.y,
//                 0.22 * imgEl.width,
//                 0.22 * imgEl.height,
//             );
//             fabricRef.current.add(occlusionEl);
//             fabricRef.current.setActiveObject(occlusionEl);
//             fabricRef.current.renderAll();
//         };
//         const deleteOcclusion = () => {
//             fabricRef.current.remove(fabricRef.current.getActiveObject());
//             fabricRef.current.renderAll();
//         };
//         const onCIdChange = () => {
//             if (fabricSelection) {
//                 fabricRef.current
//                     .getActiveObject()
//                     ._objects[1].set("text", cidSelectorRef.current.value);
//                 fabricRef.current.renderAll();
//             }
//         };
//         return (
//             <div>
//                 <div
//                     className="flex"
//                     style={{
//                         justifyContent: "space-between",
//                         marginTop: "0.3rem",
//                         marginBottom: "0.6rem",
//                     }}
//                 >
//                     <div className="flex" style={{ alignItems: "center" }}>
//                         <i
//                             className="ti"
//                             dangerouslySetInnerHTML={{ __html: ANKI_ICON }}
//                         ></i>
//                         <h3 className="text-lg" style={{ marginLeft: "4px" }}>
//                             Occlusion Editor
//                         </h3>
//                     </div>
//                     <a href="https://github.com/sponsors/debanjandhar12">
//                         <img
//                             alt="Donate"
//                             style={{ height: "1.6rem" }}
//                             src={DONATE_ICON}
//                         />
//                     </a>
//                 </div>
//                 <div
//                     className="occlusion-editor-toolbar flex"
//                     style={{
//                         justifyContent: "end",
//                         alignItems: "center",
//                         marginBottom: "0.3rem",
//                     }}
//                 >
//                     <button
//                         onClick={addOcclusion}
//                         className="ui__button bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm"
//                         style={{
//                             margin: "0.125rem 0.25rem 0.125rem 0",
//                             padding: ".35rem .35rem",
//                         }}
//                     >
//                         <i
//                             className="ti ti-plus"
//                             style={{ fontSize: "1.25rem" }}
//                         ></i>
//                     </button>
//                     <button
//                         onClick={deleteOcclusion}
//                         className="ui__button bg-indigo-600 hover:bg-indigo-700 focus:border-indigo-700 active:bg-indigo-700 text-center text-sm"
//                         style={{
//                             margin: "0.125rem 0.25rem 0.125rem 0",
//                             padding: ".35rem .35rem",
//                         }}
//                         disabled={fabricSelection == null}
//                     >
//                         <i
//                             className="ti ti-trash"
//                             style={{ fontSize: "1.25rem" }}
//                         ></i>
//                     </button>
//                     <span style={{ fontSize: "0.875rem", marginLeft: "1rem" }}>
//                         Cloze Id:
//                     </span>{" "}
//                     <select
//                         ref={cidSelectorRef}
//                         onChange={onCIdChange}
//                         className="form-select is-small"
//                         style={{ margin: "0", width: "80px", height: "2.2rem" }}
//                         disabled={fabricSelection == null}
//                     >
//                         {_.range(1, 10).map((i) => (
//                             <option key={i} value={i}>
//                                 {i}
//                             </option>
//                         ))}
//                     </select>
//                 </div>
//                 <div
//                     className="cloze-editor-canvas-container flex"
//                     style={{ justifyContent: "center" }}
//                 >
//                     <canvas ref={canvasRef} />
//                 </div>
//             </div>
//         );
//     },
// );

function createOcclusionRectEl(
    left = 0,
    top = 0,
    width = 80,
    height = 40,
    angle = 0,
    cId = 1,
) {
    const rect = new fabric.Rect({
        fill: "#FFEBA2",
        stroke: "#000",
        strokeWidth: 1,
        strokeUniform: true,
        noScaleCache: false,
        opacity: 0.8,
        width: width,
        height: height,
        originX: "center",
        originY: "center",
    });
    const text = new fabric.Text(`${cId}`, {
        originX: "center",
        originY: "center",
    });
    text.scaleToHeight(height);
    const group = new fabric.Group([rect, text], {
        left: left,
        top: top,
        width: width,
        height: height,
        originX: "center",
        originY: "center",
        angle: angle,
    });
    return group;
}


</script>