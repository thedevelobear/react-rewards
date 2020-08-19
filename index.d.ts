import {PropsWithChildren, Ref} from "react";

export type RewardElement = {
    rewardMe(): void
    punishMe(): void
}

export type RewardConfig = {
    lifetime?: number
    angle?: number
    decay?: number
    spread?: number
    startVelocity?: number
    elementCount?: number
    elementSize?: number
    zIndex?: number
    springAnimation?: boolean
    colors?: string[]
    emoji?: string[]
}

export type RewardProps = {
    ref: Ref<RewardElement>
    type?: 'confetti' | 'emoji' | 'memphis'
    config?: RewardConfig
}

export default function Reward(props: PropsWithChildren<RewardProps>): JSX.Element
