<script>

    const modules = import.meta.glob('/src/routes/**');

    const routes = Object.keys(modules)
        .filter(path => path.endsWith('+page.svelte'))
        .map(path => path .replace('/src/routes', '')
        .replace('/+page.svelte', '')
        .replace(/\[([^\]]+)\]/g, ':$1') );

    const desc = {
        "/metalom": "(pr-BR) calcular metalom da string da minha lib do OpenSCAD"
    };
</script>


<h1>Luis Henrique Space - Tools</h1>
<h2>Toolist</h2>
<ul>
    {#each routes as route}
        <li>
            <a href={route}>{route}</a>
            {#if desc[route]}
                - <span class="routeDesc">{desc[route]}</span>
            {/if}
        </li>
    {/each}
</ul>

<style>
    .routeDesc {
        
        color: gray;
        font-size: 0.8em;
    }
</style>
