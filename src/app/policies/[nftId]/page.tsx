import Content from "./content";

async function Page(props: { params: Promise<{ nftId: string }> }) {
    const params = await props.params;
    return <Content nftId={params.nftId} />;
}

export default Page;
