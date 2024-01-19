
export default function Chatroom({ params }) {
    const uuid = params.uuid;

    return (
        <h1>Welcome to Chatroom {uuid}</h1>
    );
}