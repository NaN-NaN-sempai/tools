<script>
    const modules = import.meta.glob('/src/routes/**/+page.svelte');

    const routes = Object.keys(modules)
        .map(path => path .replace('/src/routes', '')
        .replace('/+page.svelte', '')
        .replace(/\[([^\]]+)\]/g, ':$1') );

    const desc = {
        "/metalon": `(pr-BR) calcular metalom e madeira da string da <a href="/metalon/lib">minha lib do OpenSCAD</a>`,
        "/pasteImage": "Paste image and get Base64 and image preview",
    };
    const hide = [
        "/metalon/lib",
    ];
</script>


<div class="container">
    <h2>Toolist :</h2>
    <ul>
        {#each routes as route}
        {#if !hide.includes(route)}
        
            <div class="item">
                <a class="title" href={route}>
                    {route}
                </a>
                {#if desc[route]}
                    <span class="routeDesc">{@html desc[route]}</span>
                {/if}
            </div>
        {/if}
        {/each}
    </ul>

</div>
<style>
    * {font-family: sans-serif}
    .routeDesc {
        
        color: gray;
        font-size: 0.8em;
    }
    .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        box-sizing: border-box;
    }
    .container h1, .container h2 {
        text-align: center;
    }

    .container ul {
        list-style: none;
        padding: 0;
    }

    .container .title {
        background: #1c1931;
        color: white;
        font-weight: bold;
        padding: 5px;
        display: block;
        text-align: center;
        border-radius: 5px;
        margin-bottom: .5rem;
    }
    .container .item {
        margin: 10px 0;
        padding: 5px 10px;
        border: solid 1px #ccc;
        border-radius: 5px;
    }
</style>
