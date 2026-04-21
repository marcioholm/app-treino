import { LucideIcon } from 'lucide-react';
import GradientButton from '@/components/trainer/GradientButton';
import Link from 'next/link';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-glass rounded-[2.5rem] border-white/5 backdrop-blur-3xl">
            <div className="size-20 rounded-3xl bg-white/5 grid place-items-center mb-8 text-muted-foreground/30">
                <Icon size={40} />
            </div>
            <h3 className="font-display text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-muted-foreground text-base max-w-sm mx-auto leading-relaxed mb-10">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link href={actionHref}>
                    <GradientButton size="md">
                        {actionLabel}
                    </GradientButton>
                </Link>
            )}
        </div>
    );
}
