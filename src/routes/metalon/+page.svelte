<script>
    import { onMount, tick } from "svelte";
    

    import LZString from "lz-string";
    export let data;
    

let input;
let metric = 6;
let price;

let info = {};
let list = [];

let met = [];
let metaQnt = [];
let metaQntCeil = [];

let pric = [];

const savedPrices = {
    "2 x 2": 40,
};


let form;
let formObject = {};

async function displayInfo(infoObj){
    formObject = Object.fromEntries(new FormData(form));

    info = infoObj.sizes !== undefined ? infoObj : gatherInfo(input.value);

    await tick();
    
    notesTextareaChange();
    
    formObject = Object.fromEntries(new FormData(form));

    info.totalPrice = 0;
    info.sum?.forEach((e,i)=>{
        const price = formObject["price "+e.type] || info.sizes[i]?.price || 0;
        const qnt = Math.ceil((e.length/100)/6);
        info.totalPrice += price * qnt;
    });
}


let useCuttingStock = false;
function cuttingStockMetalon(pieces) {
    let allPieces = [];
    pieces.forEach(p => {
        for(let i=0;i<p.qnt;i++) allPieces.push(p.length);
    });

    allPieces.sort((a,b)=>b-a);

    let minMetalons = allPieces.length;

    function search(index, bins) {
        if(index === allPieces.length){
            minMetalons = Math.min(minMetalons, bins.length);
            return;
        }

        const piece = allPieces[index];

        for(let i=0;i<bins.length;i++){
            if(bins[i] + piece <= metric * 100){
                bins[i] += piece;
                search(index+1, bins);
                bins[i] -= piece;
            }
        }

        bins.push(piece);
        search(index+1, bins);
        bins.pop();
    }

    search(0, []);

    return minMetalons;
}

function gatherInfo(str){

    let sizes =[];
    let sum = [];
    let metAmt = [];
    let woodSizes = [];

    const metalomList = [];
    const woodList = [];
    
    
    if(str && info.sizes == undefined){
        str.split("\n").filter(e=>e).forEach(e=>{
            let split = e.slice(12,-1).split(" => ");

            if (e.includes("met.")) {
                const data = e.slice(12,-1).split(" => ");
                metalomList.push(data);
            } 
            else if (e.includes("mad.")) {
                const data = e.slice(12,-1).split(" => ");
                woodList.push(data);
            }
        });
        
        metalomList.forEach(([type, length])=>{
            length = parseFloat(length);
            type = type
                .split(' x ')
                .map(Number)
                .sort((a, b) => a - b)
                .join(' x ');

            let typeQuery = sizes.find(e=>e.type == type);

            if(!typeQuery) sizes.push({type, sizes: [],
                price: formObject["price "+type] || savedPrices[type] || savedPrices["2 x 2"]});

            const item = sizes.find(e=>e.type == type);
            const query = item.sizes.find(e=>e.length == length);
            
            if(query) query.qnt += 1;
            else item.sizes.push({qnt: 1, length});
        });

        sizes.forEach(e=>{
            let total = 0;
            
            e.sizes.forEach(e=>total += e.qnt * e.length);
            sum.push({type: e.type, length: total});
        });
        
        const metAmt = useCuttingStock?
        sizes.map(e => ({
            type: e.type,
            metalons: cuttingStockMetalon(e.sizes)
        })) :
        sizes.map(e => {
            let allPieces = [];
            e.sizes.forEach(s => {
                for(let i = 0; i < s.qnt; i++) allPieces.push(s.length);
            });
            
            allPieces.sort((a,b) => b-a);

            let metalons = [];

            allPieces.forEach(p => {
                let placed = false;
                for(let i=0; i<metalons.length; i++){
                    if(metalons[i] + p <= metric * 100){
                        metalons[i] += p;
                        placed = true;
                        break;
                    }
                }
                if(!placed) metalons.push(p);
            });
            return { type: e.type, metalons: metalons.length };
        });
        
        woodList.forEach(([type, length])=>{
            length = parseFloat(length);
            type = type
                .split(' x ')
                .map(Number)
                .sort((a, b) => a - b)
                .join(' x ');

            let typeQuery = woodSizes.find(e=>e.type == type);

            if(!typeQuery) woodSizes.push({type, qnt: 1});
            else typeQuery.qnt += 1;                
        });
    } else {
        sizes = info.sizes;
        sum = info.sum;
        metAmt = info.metAmt;
        woodSizes = info.woodSizes;        
    }
    
    




    let tintasPrice = 0;

    (tintas || []).forEach(e=>{
        tintasPrice += e.price * e.qnt;
    });

    let adicionaisPrice = 0;
    (adicionais || []).forEach(e=>{
        adicionaisPrice += e.price;
    });

    return {
        sum, metAmt, sizes, woodSizes, tintasPrice, adicionaisPrice,
    }

}



const toggleInputArea = () => {
    inputAreaVisible = !inputAreaVisible;
    window.scrollTo(0, 0);
}


let tintas = [
    {
        name: "Preto Fosco",
        qnt: 1,
        price: 100
    }
];
const addTinta = () => {
    tintas.push({
        name: "Preto Fosco",
        qnt: 1,
        price: 100
    });

    displayInfo();

    tintas = tintas;   
}
const removeTinta = (index) => {
    tintas.splice(index, 1);
    tintas = tintas;

    displayInfo();
}


let adicionais = [];
let adicionaisCounter = 0;
const addAdicional = () => {
    let c = adicionaisCounter++;

    adicionais.push({
        name: "Mão de obra" + (c? " " + c : ""),
        price: 100
    });

    displayInfo();

    adicionais = adicionais;   
}
const removeAdicional = (index) => {
    adicionais.splice(index, 1);
    adicionais = adicionais;

    displayInfo();
}


let orderNotes = "";
let notesTextarea;
const notesTextareaChange = () => {    
    notesTextarea.style.height = "auto";
    notesTextarea.style.height = notesTextarea.scrollHeight + 3 + "px";
}


let infoName;
let savedOrders = [];
const gatherOrder = () => {
    return {
        info,
        tintas,
        name: infoName.value,
        notes: orderNotes,
        adicionais,
        metric
    };
}
const saveOrder = () => {
    const saveObj = gatherOrder();
    
    savedOrders = JSON.parse(localStorage.getItem("savedOrders") || "[]");

    if(!infoName.value){
        return alert("Insira um nome para o orçamento!");
    }

    if(savedOrders.find(e=>e.name == infoName.value)){
        savedOrders = savedOrders.map(e=>{
            if(e.name == infoName.value) return saveObj;
            return e;
        });

        alert("Orçamento '" + infoName.value + "' atualizado com sucesso!");

    } else {
        savedOrders.push(saveObj);

        alert("Orçamento '" + infoName.value + "' salvo com sucesso!");
    }

    localStorage.setItem("savedOrders", JSON.stringify(savedOrders));

    window.location.search = `order=${infoName.value}`;
}
const loadOrderObj = obj => {
    info = obj.info;
    tintas = obj.tintas;
    infoName.value = obj.name;
    adicionais = obj.adicionais;
    metric = obj.metric;
    orderNotes = obj.notes;

    displayInfo(obj.info);

    const url = new URL(window.location);
    url.searchParams.set("order", obj.name);

    window.history.replaceState({}, "", url);
}

const loadOrder = (e) => {
    let localSave = JSON.parse(localStorage.getItem("savedOrders") || "[]");

    const order = localSave[e.target.value];

    if(!order) return alert("Nenhum orçamento encontrado!");

    loadOrderObj(order);
}

const shareOrder = () => {
    const obj = gatherOrder();

    const totalValue = 
        (info?.totalPrice || 0) +
        (info?.tintasPrice || 0) + 
        (info?.adicionaisPrice || 0);

    navigator.share({
        title: "Luís Henrique Space - Tools | Orçamento Metalon",
        url: window.location.href.split("?")[0] + `?shared=${LZString.compressToEncodedURIComponent(JSON.stringify(obj))}&name=${obj.name}&value=${totalValue}`
    })
    
}

let inputAreaVisible = true;
onMount(() => {
    savedOrders = JSON.parse(localStorage.getItem("savedOrders") || "[]");
    
    // get search
    const urlParams = new URLSearchParams(window.location.search);
    const order = urlParams.get("order");
    const shared = urlParams.get("shared");

    inputAreaVisible = false;

    let query;
    if(shared) {
        query = JSON.parse(LZString.decompressFromEncodedURIComponent(shared));
        
    } else {
        query = savedOrders.find(e=>e.name == order);
    }

    if(!query) return inputAreaVisible = true;

    loadOrderObj(query);
});
</script>


<svelte:head>
	<meta property="og:title" content="Luís Henrique Space - Tools | Metalon">
    <meta property="og:description" content="Ferramenta para orçamentos de metalon - Luís Henrique Space | Tools">
	<meta property="og:image" content="https://pay.luishenrique.space/api/imgval/tools-metalon?{data.value? "value=" + data.value + "&" : ""}{data.name? "name=" + data.name : ""}">
</svelte:head>



<form class="container" on:submit|preventDefault bind:this={form}>

    <div class="inputArea" class:visible={!inputAreaVisible}>
        <h1>Orçamento</h1>
        <h2>~ {infoName?.value || "Novo Orçamento"} ~</h2>
        <br><br>
    </div>

    <div class="inputArea" class:visible={inputAreaVisible}>
        <h3>Nome do Orçamento : </h3>
        <input type="text" bind:this={infoName} />
        <button on:click={saveOrder}>salvar</button>
        <br>
        
        <label> Carregar Orçamento :
            <select on:change={loadOrder}>
                <option value="">Nenhum</option>
                {#each savedOrders as order, index}
                    <option value={index}>{order.name}</option>
                {/each}
            </select>
        </label>
        <br><br>

        <label> Compartilhar Orçamento :
            <button on:click={shareOrder}>compartilhar</button>
        </label>
        <br><hr>

        <h3>Codigo do OpenSCAD :</h3>
        <label>
            <input type="checkbox" bind:checked={useCuttingStock}>
            <small> Usar <strong>cutting stock</strong> - metalon (mais pesado) </small>
        </label>
        <textarea class="input" placeholder="ex:
        ECHO: 'met. 2 x 2 => 59.5'
        ECHO: 'met. 2 x 2 => 59.5'" bind:this={input} on:input={displayInfo}>{1? "":`PRATELEIRA JANELA
    ECHO: "met. 20 x 20 => 170"
    ECHO: "met. 20 x 20 => 170"
    ECHO: "met. 20 x 20 => 30"
    ECHO: "met. 20 x 20 => 170"
    ECHO: "met. 20 x 20 => 170"
    ECHO: "met. 20 x 20 => 30"
    ECHO: "mad. 224 x 30 x 2"
    ECHO: "mad. 224 x 30 x 2"`}</textarea>
        <br><br>

        <h3>Metragem Metalon :</h3>
        <input class="input metric" type="number" min="1" bind:value={metric} on:input={displayInfo}/>
        <br><br>

        <h3>Preço Metalon :</h3>
        {#each (info.sizes || []) as item}
            <h4>{item.type}</h4>
            <input class="input" type="number" name="price {item.type}" placeholder="preço {item.type}" bind:value={item.price} on:input={displayInfo}/>
        {:else}
            <h4>Aguardando dados...</h4>
        {/each}
        <br>
        <br>

        <h3>Tintas :</h3>
        <button on:click={addTinta}>Adicionar tinta</button>
        {#each tintas as tinta, index}
            <br>
            <br>
            <input type="text" id="tinta_{index}" bind:value={tinta.name} placeholder="Nome da tinta">
            <br>
            <input type="number" id="tinta_{index}_qnt" bind:value={tinta.qnt} on:input={displayInfo} placeholder="Quantidade">
            <br>
            <input type="number" id="tinta_{index}_price" bind:value={tinta.price} on:input={displayInfo} placeholder="Preço">
            <br>
            <button on:click={() => removeTinta(index)}>remover</button>
        {:else}
        <h4>Sem tintas...</h4>
        {/each}
        <br>
        <br>

        <h3>Adicionais :</h3>
        <button on:click={addAdicional}>Adicionar adicional</button>
        {#each adicionais as item, index}
            <br>
            <br>
            <input type="text" id="adc_{index}" bind:value={item.name} placeholder="Nome do adicional">
            <br>
            <input type="number" id="adc_{index}_price" bind:value={item.price} on:input={displayInfo} placeholder="Preço">
            <br>
            <button on:click={() => removeAdicional(index)}>remover</button>
        {:else}
        <h4>Sem adicionais...</h4>
        {/each}
        <br>
        <br>

        <br>

        <hr>
    </div>

    <div class="output">
        <div class="spliter">
            <div class="outputContainer">
                <h3>Preço total :</h3>
                    <p>
                        Total =
                        <span class="highlight total"> R$ {(
                            (info?.totalPrice || 0) +
                            (info?.tintasPrice || 0) + 
                            (info?.adicionaisPrice || 0)
                        )?.toFixed(2)}</span>
                    </p>
                    
                    {#if info?.totalPrice}
                    <p class="metalon">
                        <span class="highlight">Metalon</span>
                        =
                        <span class="highlight price">R$ {info?.totalPrice?.toFixed(2)}</span>
                    </p>
                    {/if}

                    {#if info?.tintasPrice}
                    <p class="tintas">
                        <span class="highlight">Tintas</span>
                        =
                        <span class="highlight price">R$ {info?.tintasPrice?.toFixed(2)}</span>
                    </p>
                    {/if}

                    {#if info?.adicionaisPrice}
                    {#each adicionais as item}
                        <p class:madeira={item.name.toLowerCase().includes("madeira")}
                            class="adicionais">
                            +
                            <span class="highlight">{item.name}</span>
                            =
                            <span class="highlight price">R$ {(item.price || 0).toFixed(2)}</span>
                        </p>
                        
                    {/each}
                    {/if}
                    

                <div class="outputContainer">
                    <h3>Notas : </h3>
                    <p>
                        <textarea placeholder="Notas gerais sobre o orcamento..."
                            readonly={!inputAreaVisible}
                            style:resize={inputAreaVisible ? "vertical" : "none"}
                            bind:value={orderNotes}
                            on:input={notesTextareaChange}
                            bind:this={notesTextarea}></textarea>
                    </p>
                </div>
            </div>
        </div>
    </div> 
    
    <hr>


    <div class="output">

        {#if info.sum != undefined}
            <div class="spliter">

                <div class="outputContainer">
                    <h3>Preço Metalon :</h3>
                    <p class="metalon">
                        Total =
                        <span class="highlight total"> R$ {info?.totalPrice?.toFixed(2)}</span>
                    </p>
                    {#each info.sum as {type, length}}
                        <p class="metalon">
                            <span class="highlight">{info.metAmt.find(e=>e.type == type).metalons}</span>
                            und 
                            <span class="highlight">{type}</span> =
                            <span class="highlight price"> R$ {(Math.ceil((length/100)/metric) * formObject["price "+type]).toFixed(2)}</span>
                        </p>
                    {:else}
                        <p class="metalon"><i><small>Sem metalons...</small></i></p>
                    {/each}
                </div>

                <div class="outputContainer">
                    <h3> Preço Tintas : </h3>
                    <p class="tintas">
                        Total =
                        <span class="highlight total"> R$ {info?.tintasPrice?.toFixed(2)}</span>
                    </p>
                    {#each tintas as {qnt, name, price}}
                    <p class="tintas">
                        <span class="highlight">{qnt}</span>
                        und 
                        <span class="highlight">{name}</span>
                        =
                        <span class="highlight price">R$ {((qnt*price) || 0).toFixed(2)}</span>
                    </p>
                    {:else}
                        <p class="tintas"><i><small>Sem tintas...</small></i></p>
                    {/each}
                </div>
                
                
                <div class="outputContainer">
                    <h3> Adicionais : </h3>
                    <p class="adicionais">
                        Total =
                        <span class="highlight total"> R$ {(info?.adicionaisPrice || 0).toFixed(2)}</span>
                    </p>
                    {#each adicionais as {name, price}}
                    <p class="adicionais">
                        <span class="highlight">{name}</span>
                        =
                        <span class="highlight price">R$ {(price || 0).toFixed(2)}</span>
                    </p>
                    {:else}
                        <p class="adicionais"><i><small>Sem adicionais...</small></i></p>
                    {/each}
                </div>
                <hr>
            </div>


            <div class="spliter">
            
                <div class="outputContainer">
                    <h3>Soma Metalon :</h3>
                    {#each info.sum as {type, length}}
                        <p class="metalon">
                            <span class="highlight">{type}</span>
                            =
                            <span class="highlight">{(length/100).toFixed(2)}m</span>
                            |
                            <span class="highlight">{info.metAmt.find(e=>e.type == type).metalons}</span>
                            und
                            <span class="highlight"> <small>≈ {((length/100)/metric).toFixed(2)}</small></span>
                        </p>
                    {:else}
                        <p class="metalon"><i>Aguardando dados...</i></p>
                    {/each}
                </div>

                <div class="outputContainer">
                    <h3>Lista Metalon :</h3>
                    {#each info.sizes as {type, sizes}}
                    {#each sizes as {qnt, length}}
                    <p class="metalon">
                        <span class="highlight">{qnt}</span>
                        und =
                        <span class="highlight">
                            {type.split(' x ')[0]}
                            <small>x</small>
                            {type.split(' x ')[1]}
                        </span>
                        x
                        <span class="highlight">{length}</span>
                        cm
                    </p>
                    
                    {/each}
                    {:else}
                        <p class="metalon"><i>Aguardando dados...</i></p>
                    {/each}
                </div>

                <div class="outputContainer">
                    <h3>Lista Madeira :</h3>
                    {#each info.woodSizes as {qnt, type}}
                    <p class="madeira">
                        <span class="highlight">{qnt}</span>
                        und =
                        <span class="highlight">
                            {type.split(' x ')[0]}
                            <small>x</small>
                            {type.split(' x ')[1]}
                            <small>x</small>
                            {type.split(' x ')[2]}
                        </span>
                        cm
                    </p>
                    {:else}
                        <p class="madeira"><i>Aguardando dados...</i></p>
                    {/each}
                </div>
                
                <hr>                
            </div>
            
        {/if}

    </div>
    
    <h4>
        <button on:click={toggleInputArea}>
            {inputAreaVisible ? "Fechar" : "Abrir"} menu de entradas
        </button>
    </h4>
</form>


<style>

.output p.metalon {
    background: rgba(0, 0, 0, 0.48);
    color: white;
}

.output p.tintas {
    background: #a24ead91;
}

.output p.adicionais {
    background: #328cd56e;
}

.output p.madeira {
    background: #8f57096e;
}

.inputArea {
    display: none;
}
.inputArea.visible {
    display: block;
}
.container {
    padding: 30px;
}
.container * {margin: 0; padding: 0; font-family: sans-serif}
.input {
    width: 100%;
    padding-inline: 5px;
    box-sizing: border-box;
}
h3, h1, h2, h4, p {text-align:center}

textarea {
    resize: vertical;
    min-height: 2rem;
}

hr {
    margin: 20px !important;
    border: none;
    border-top: 1px solid black;
}
.output p {
	background: rgba(0,0,0,.1);
    margin-inline: 0px;
    border-radius: 5px;
    padding: 10px;
	width: auto;
    margin-bottom: 5px;
}
.output p textarea {
    width: 100%;
    outline: none;
    border: none;
    background: transparent;
    text-align: center;
}
.output .highlight {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    padding: 1px 7px;
    color: rgb(0, 194, 237);
    font-weight: bold;
}
.output .highlight.price {
    color: #16A34A;
}
.output .highlight.total {
    color: #008dc4;
}

.output {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.output .spliter {
    width: 100%;
}
.spliter hr {
    opacity: .3;
}

.output .outputContainer h3 {
    margin-top: 15px;
}


@media screen and (max-width: 810px) {
    .output {
        flex-direction: column;
        gap: 0;
    }    
    
}
</style>
