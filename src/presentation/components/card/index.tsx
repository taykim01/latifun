import "./card.css";

export default function Card(props: {
    front: {
        title: string;
        content: string;
    };
    back: {
        title: string;
        content: string;
    };
}) {
    return (
        <div className="flip-card">
            <div className="flip-card-inner">
                <div className="flip-card-front">
                    <p className="title">{props.front.title}</p>
                    <p>{props.front.content}</p>
                </div>
                <div className="flip-card-back">
                    <p className="title">{props.back.title}</p>
                    <p>{props.back.content}</p>
                </div>
            </div>
        </div>
    );
}
