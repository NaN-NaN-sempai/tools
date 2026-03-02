<script>
    import { page } from "$app/state";
    import { onMount, tick } from "svelte";

    page.title = "Metalon";

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

async function displayInfo() {
	info = gatherInfo(input.value);

    await tick();

    formObject = Object.fromEntries(new FormData(form));

    info.totalPrice = 0;
    info.sum.forEach(e=>{
        const price = formObject["price "+e.type] || 0;
        const qnt = Math.ceil((e.length/100)/6);
        info.totalPrice += price * qnt;
    });
    
}


let useCuttingStock = true;
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
    const metalomList = [];
    const woodList = [];
    
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

    const sizes = [];

    metalomList.forEach(([type, length])=>{
        length = parseFloat(length);
        type = type
            .split(' x ')
            .map(Number)
            .sort((a, b) => a - b)
            .join(' x ');

        let typeQuery = sizes.find(e=>e.type == type);

        if(!typeQuery) sizes.push({type, sizes: []});

        const item = sizes.find(e=>e.type == type);
        const query = item.sizes.find(e=>e.length == length);
        
        if(query) query.qnt += 1;
        else item.sizes.push({qnt: 1, length});
    });

    const sum = [];

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
    
    

    const woodSizes = [];

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


    return {
        sum, metAmt, sizes, woodSizes
    }

}

onMount(async()=>{
    displayInfo();
})

</script>




<form class="container" on:submit|preventDefault bind:this={form}>
    <h3>Metragem Metalon :</h3>
    <input class="input metric" type="number" min="1" bind:value={metric} on:input={displayInfo}/>
    <br>
    <br>

    <h3>Preço Metalon :</h3>
    {#each info.sizes as item}
        <h4>{item.type}</h4>
        <input class="input" type="number" name="price {item.type}" placeholder="preço {item.type}" on:input={displayInfo} value={savedPrices[item.type] || 40}/>
    {:else}
        <h4>Aguardando dados...</h4>
    {/each}

    <br>
    <br>

    <h3>Codigo do OpenSCAD :</h3>
    <label>
        <input type="checkbox" bind:checked={useCuttingStock}>
        <small> Usar <strong>cutting stock</strong> - metalon (mais pesado) </small>
    </label>
    <textarea class="input" placeholder="ex:
    ECHO: 'met. 2 x 2 => 59.5'
    ECHO: 'met. 2 x 2 => 59.5'" bind:this={input} on:input={displayInfo}>
PRATELEIRA JANELA
ECHO: "met. 20 x 20 => 170"
ECHO: "met. 20 x 20 => 170"
ECHO: "met. 20 x 20 => 30"
ECHO: "met. 20 x 20 => 170"
ECHO: "met. 20 x 20 => 170"
ECHO: "met. 20 x 20 => 30"
ECHO: "mad. 224 x 30 x 2"
ECHO: "mad. 224 x 30 x 2"
    </textarea>

    <hr>

    <div class="output">

        {#if info.sum != undefined}
            <div class="spliter">
                <div class="outputContainer">
                    <h3>Soma Metalon :</h3>
                    {#each info.sum as {type, length}}
                        <p>
                            <span class="highlight">{type}</span>
                            =
                            <span class="highlight">{(length/100).toFixed(2)}m</span>
                            |
                            <span class="highlight">{info.metAmt.find(e=>e.type == type).metalons}</span>
                            metalon
                            <span class="highlight"> <small>≈ {((length/100)/metric).toFixed(2)}</small></span>
                        </p>
                    {/each}
                </div>

                <div class="outputContainer">
                    <h3>Preço Metalon :</h3>
                    <p>
                        Total =
                        <span class="highlight"> R$ {info?.totalPrice?.toFixed(2)}</span>
                    </p>
                    {#each info.sum as {type, length}}
                        <p>
                            <span class="highlight">{type}</span> =
                            <span class="highlight"> R$ {(Math.ceil((length/100)/6) * formObject["price "+type]).toFixed(2)}</span>
                        </p>
                    {/each}
                </div>
            </div>

            <div class="spliter">
                <div class="outputContainer">
                    <h3>Lista Metalon :</h3>
                    {#each info.sizes as {type, sizes}}
                    {#each sizes as {qnt, length}}
                    <p>
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
                    {/each}
                </div>

                <div class="outputContainer">
                    <h3>Lista Madeira :</h3>
                    {#each info.woodSizes as {qnt, type}}
                    <p>
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
                    {/each}
                </div>
            </div>
            
        {/if}

    </div>
</form>


<style>
.container {
    padding: 30px;
}
.container * {margin: 0; padding: 0; font-family: sans-serif}
.input {
    width: 100%;
    padding-inline: 5px;
}
h3, h4, p {text-align:center}

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
.output .highlight {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    padding: 1px 7px;
    color: rgb(0, 194, 237);
    font-weight: bold;
}

.output {
    display: flex;
    flex-direction: row;
    gap: 10px;
}

.output .spliter {
    width: 100%;
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
