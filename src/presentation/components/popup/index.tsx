"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Button from "../button";
import Icons from "../icons";

export default function Popup(props: {
    title?: string;
    description?: ReactNode | string;
    open?: boolean;
    onClose?: () => void;
    buttons?: {
        back?: {
            onClick: () => void;
            text: string;
        };
        next?: {
            onClick: () => void;
            text: string;
        };
    };
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (props.open) {
            setIsAnimating(true);
            setTimeout(() => setIsVisible(true), 50);
        } else {
            setIsVisible(false);
            setTimeout(() => setIsAnimating(false), 500);
        }
    }, [props.open]);

    return (
        <div
            className={`fixed inset-0 bg-gray-900 bg-opacity-30 transition-opacity duration-500 ${
                isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ zIndex: 9999 }}
            onClick={props.onClose}
        >
            <div
                className={`
                    fixed left-1/2 transform -translate-x-1/2
                    bg-white w-[360px] p-8 rounded-sm
                    flex flex-col items-center gap-10
                    transition-all duration-1000 ease-in-out
                    ${isVisible ? "bottom-1/2 translate-y-1/2" : "bottom-0 translate-y-full"}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4" onClick={props.onClose}>
                    <Icons.X />
                </div>
                <div className="w-full flex flex-col gap-2">
                    <div className="text-title-4 text-gray-900">{props.title}</div>
                    <div className="text-body-14-r text-gray-900">{props.description}</div>
                </div>
                {props.buttons && (
                    <div className="flex gap-2 w-full justify-end">
                        {props.buttons && props.buttons.back && (
                            <Button.Default onClick={props.buttons.back.onClick} label={props.buttons.back.text} />
                        )}
                        {props.buttons && props.buttons.next && (
                            <Button.Default onClick={props.buttons.next.onClick} label={props.buttons.next.text} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
