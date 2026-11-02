'use client';

import React, { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import Cookies from 'universal-cookie';

import { ChannelListContainer, ChannelContainer } from '@/components/chat';

const apiKey = 's8qx2r3ax8em'; // ご自身のStream API Key
const cookies = new Cookies();

// SSR時のエラーを防ぐため、クライアントサイドでのみインスタンスを取得する
let client = null;
if (typeof window !== 'undefined') {
    client = StreamChat.getInstance(apiKey);
}

export default function Smpl6() {
    const [createType, setCreateType] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        if (!client) {
            setIsConnecting(false);
            return;
        }

        const userId = cookies.get('userId');
        const token = cookies.get('token');
        const username = cookies.get('username');

        if (userId && token && !client.userID) {
            client.connectUser(
                {
                    id: userId,
                    name: username,
                    fullName: cookies.get('fullName'),
                    image: cookies.get('avatarURL'),
                },
                token
            ).then(() => {
                setIsConnecting(false);
            }).catch((err) => {
                console.error("Stream Chat Connection Error:", err);
                setIsConnecting(false);
            });
        } else {
            setIsConnecting(false);
        }
    }, []);

    if (isConnecting || !client) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <p style={{ color: '#f8fafc' }}>Loading Chat Connection...</p>
            </div>
        );
    }

    return (
        <div className="chat-page__container" style={{ width: '100%', height: '80vh', display: 'flex' }}>
            <Chat client={client} theme="team blue">
                <ChannelListContainer
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    setCreateType={setCreateType}
                    setIsEditing={setIsEditing}
                />
                <ChannelContainer
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    createType={createType}
                />
            </Chat>
        </div>
    );
}