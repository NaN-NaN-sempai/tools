<script>

    const modules = import.meta.glob('/src/routes/**');

    const routes = Object.keys(modules)
        .filter(path => path.endsWith('+page.svelte'))
        .map(path => path .replace('/src/routes', '')
        .replace('/+page.svelte', '')
        .replace(/\[([^\]]+)\]/g, ':$1') );

    const desc = {
        "/metalom": `(pr-BR) calcular metalom e madeira da string da <a href="/metalom/lib">minha lib do OpenSCAD</a>`,
    };
    const hide = [
        "/metalom/lib",
    ];
</script>


<h1>Luis Henrique Space - Tools</h1>
<h2>Toolist</h2>
<ul>
    {#each routes as route}
    {#if !hide.includes(route)}
    
        <li>
            <a href={route}>{route}</a>
            {#if desc[route]}
                - <span class="routeDesc">{@html desc[route]}</span>
            {/if}
        </li>
    {/if}
    {/each}
</ul>

<style>
    * {font-family: sans-serif}
    .routeDesc {
        
        color: gray;
        font-size: 0.8em;
    }
</style>
