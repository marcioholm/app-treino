import webPush from 'web-push';

export const sendPushNotification = async (subscriptionStr: string | null, payload: any) => {
    if (!subscriptionStr || !process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        return;
    }

    try {
        const _subscription = JSON.parse(subscriptionStr);
        webPush.setVapidDetails(
            'mailto:suporte@mkfitness.com.br',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );

        await webPush.sendNotification(_subscription, JSON.stringify(payload));
    } catch (e) {
        console.error('Failed to send push notification', e);
    }
};
