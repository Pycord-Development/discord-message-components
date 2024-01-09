import React, { ReactElement } from 'react'
import { PropsWithSlot } from '../util'
import OutboundLinkIcon from './OutboundLinkIcon'
import '@pycord/discord-message-components-core/dist/styles/discord-button.css'
import Twemoji from 'react-twemoji'

export type DiscordButtonProps = {
	disabled?: boolean
	image?: string
	type?: string
	url?: string
	emoji?: string
} & PropsWithSlot

export default function DiscordButton({ children, disabled, image, type = 'primary', url, emoji }: DiscordButtonProps): ReactElement {
	return type === 'link' && url && !disabled
		? (
			<a
				className="discord-button discord-button-link"
				href={url}
				target="_blank"
				rel="noopener noreferrer"
			>
				{image && <img className="discord-button-emoji" src={image} alt="" />}
				{emoji && <Twemoji options={{ className: 'discord-button-emoji' }}>{emoji}</Twemoji>}
				{children}
				<OutboundLinkIcon />
			</a>
		)
		: (
			<button
				className={`discord-button discord-button-${type}${disabled ? ' discord-button-disabled' : ''}`}
				disabled={disabled}
			>
				{image && <img className="discord-button-emoji" src={image} alt="" />}
				{emoji && <Twemoji options={{ className: 'discord-button-emoji' }}>{emoji}</Twemoji>}
				{children}
				{type === 'link' && <OutboundLinkIcon />}
			</button>
		)
}
