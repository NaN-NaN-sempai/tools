<script>

let input;
let metric;
let price;

let info = {};
let list = [];

let met;
let metaQnt;
let metaQntCeil;

let pric;

function displayInfo() {
	info = metalomInfo(input.value);
    
    list = Object.entries(info.sizes);

	met = parseFloat(metric.value) * 100;
    metaQnt = info.sum / met
    metaQntCeil = Math.ceil(metaQnt);
    
    pric = (metaQntCeil * price.value).toFixed(2);
	
	const output = document.querySelector(".output");

	 `
    <h3>Soma</h3>
    <p>${info.sum/100}m | ${metaQntCeil} metalom (${metaQnt})</p>
	<br>
    <h3>Preço</h3>
    <p>R$${pric}</p>
	<br>
    <h3>Lista:</h3>
    ${
    	list.map(([msr, qnt])=>`<p>${qnt} x ${msr} cm</p>`).join("")
    }`;
}


function metalomInfo(str){
    const list = str.split("\n").filter(e=>e).map(e=>{
        let split = e.slice(12,-1).split(" => ");
    
        split[1] = parseFloat(split[1]);
    
        return split;
    });

    let sizes = {};

    list.forEach(e=>{
        if(sizes[e[1]]) sizes[e[1]] += 1;
        else sizes[e[1]] = 1;
    });

    let sum = 0;
    list.forEach(e=>sum+=e[1]);

    return {
        sum, sizes, list, str
    }
}
</script>




<div class="container">
    <h3>Metragem Metalom</h3>
    <input class="input metric" type="number" value="6" min="1" bind:this={metric}/>
    <h3>Preço Metalom</h3>
    <input class="input price" type="number" value="40" min="1" bind:this={price}/>
    <h3>Codigo do OpenSCAD</h3>
    <textarea class="input" placeholder="ex:
    ECHO: 'met. 2 x 2 => 59.5'
    ECHO: 'met. 2 x 2 => 59.5'" bind:this={input} on:input={displayInfo}></textarea>

    <hr>

    <div class="output">

        {#if met != undefined}
            <h3>Soma</h3>
            <p>{info.sum/100}m | ${metaQntCeil} metalom ({metaQnt})</p>
            <br>
            <h3>Preço</h3>
            <p>R${pric}</p>
            <br>
            <h3>Lista:</h3>
            {#each list as [msr, qnt]}
            <p>
                {qnt} x {msr} cm
            </p>
            {/each}
        {/if}

    </div>
</div>


<style>
.container * {margin: 0; padding: 0; font-family: sans-serif}
.input {width: 100%}
h3,p {text-align:center}

hr {
    margin: 20px !important;
    border: none;
    border-top: 1px solid black;
}
.output p {
	background: rgba(0,0,0,.1);
    margin-inline: 20px;
    border-radius: 5px;
    padding: 10px;
	width: auto;
    margin-bottom: 5px;
}
</style>
