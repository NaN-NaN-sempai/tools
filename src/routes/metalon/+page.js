export const load = ({url}) => {

    const value = url.searchParams.get("value");
    const name = url.searchParams.get("name");


    return { title: "Orçamento Metalon", value, name };
}