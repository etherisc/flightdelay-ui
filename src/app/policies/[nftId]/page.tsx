import Content from "./content";

function Page({ params }: { params: { nftId: string } }) {
    return <Content nftId={params.nftId} />;
}

export default Page;
