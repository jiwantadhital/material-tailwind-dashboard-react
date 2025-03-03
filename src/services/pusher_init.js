import Pusher from 'pusher-js';
import { authService } from './apiService';

class PusherService {
    static instance = null;
    pusher = null;

    constructor() {
        if (PusherService.instance) {
            return PusherService.instance;
        }
        PusherService.instance = this;
    }

    async initPusher() {
        try {
            this.pusher = new Pusher('617d473f70f10c15a1df', {
                cluster: 'ap2',
                encrypted: true,
                authorizer: (channel) => ({
                    authorize: async (socketId, callback) => {
                        try {
                            const token = localStorage.getItem('token');
                            if (!token) {
                                throw new Error('Authentication token is missing');
                            }

                            const response = await fetch(`https://sajilonotary.xyz/broadcasting/auth`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    channel_name: channel.name,
                                    socket_id: socketId,
                                }),
                            });

                            if (response.ok) {
                                console.log("response",response);
                                const auth = await response.json();
                                callback(null, auth);
                            } else {
                                console.error('Pusher authorization failed:', await response.text());
                                callback(new Error('Pusher authorization failed'), null);
                            }
                        } catch (error) {
                            console.error('Pusher authorization error:', error);
                            callback(error, null);
                        }
                    }
                })
            });

            console.log('Pusher initialized');
            return this.pusher;
        } catch (error) {
            console.error('Error initializing Pusher:', error);
            throw error;
        }
    }

    subscribeToChatChannel(documentId, onMessageReceived) {
        try {
            const channelName = `private-chat.${documentId}`;
            const channel = this.pusher.subscribe(channelName);

            channel.bind('message.sent', (data) => {
                const message = data.message;
                const { user } = authService.getSavedUserData();
                const currentUserId = user?.id?.toString();
               
                if (message.user_id.toString() !== currentUserId) {
                    console.log("message",message);
                    onMessageReceived({
                        text: message.message,
                        isUser: false,
                        image: message.file,
                        timestamp: new Date(message.created_at),
                        ...message
                    });
                }
            });

            console.log(`Subscribed to chat channel: ${channelName}`);
            return channel;
        } catch (error) {
            console.error('Error subscribing to chat channel:', error);
            throw error;
        }
    }

    unsubscribeFromChatChannel(documentId) {
        try {
            const channelName = `private-chat.${documentId}`;
            this.pusher.unsubscribe(channelName);
            console.log(`Unsubscribed from chat channel: ${channelName}`);
        } catch (error) {
            console.error('Error unsubscribing from chat channel:', error);
        }
    }

    disconnect() {
        if (this.pusher) {
            this.pusher.disconnect();
            console.log('Pusher disconnected');
        }
    }
}

export const pusherService = new PusherService();
