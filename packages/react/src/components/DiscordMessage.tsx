import React, { Fragment, PropsWithChildren, ReactElement, ReactNode, isValidElement, useContext } from 'react'
import { util } from '@pycord/discord-message-components-core'
import { elementsWithoutSlot, findSlot } from '../util'
import DiscordDefaultOptions, { DiscordMessageOptions, Profile } from '../context/DiscordDefaultOptions'
import DiscordOptionsContext from '../context/DiscordOptionsContext'
import AuthorInfo from './AuthorInfo'
import '@pycord/discord-message-components-core/dist/styles/discord-message.css'
import Twemoji from 'react-twemoji'

export type DiscordMessageProps = PropsWithChildren<{
	author?: string
	avatar?: string
	bot?: boolean
	edited?: boolean
	profile?: string
	roleColor?: string
	timestamp?: Date | string,
	useTwemoji?: boolean
}>

type MaybeTwemojiProps = PropsWithChildren<{
	useTwemoji?: boolean,
	jumboable?: boolean
}>


function MaybeTwemoji({
	useTwemoji,
	jumboable,
	children,
}: MaybeTwemojiProps): ReactElement {
	if (useTwemoji) {
		return <Twemoji options={{ className: `emoji${jumboable ? ' jumboable' : ''}` }}>{children}</Twemoji>
	}
	return <>{children}</>
}


export default function DiscordMessage({
	author,
	avatar,
	bot,
	children,
	compactMode,
	edited,
	profile: profileKey,
	roleColor,
	timestamp = util.defaultTimestamp,
	useTwemoji = true,
}: DiscordMessageProps & { compactMode?: boolean }): ReactElement {
	const options: DiscordMessageOptions = useContext(DiscordOptionsContext) ?? DiscordDefaultOptions

	const profile: Profile = !profileKey ? {} : options.profiles?.[profileKey] ?? {}
	const user: Profile = {
		author: !author && profile?.author ? profile.author : author || 'User',
		avatar: util.resolveImage(options.avatars, avatar || profile?.avatar),
		bot: bot ?? profile?.bot,
		roleColor: roleColor || profile?.roleColor,
	}

	const messageTimestamp = util.parseTimestamp({
		timestamp,
		format: compactMode ? 'compact' : 'cozy',
	})

	const slots = {
		'default': children,
		actions: findSlot(children, 'actions'),
		embeds: findSlot(children, 'embeds'),
		interactions: findSlot(children, 'interactions'),
		reactions: findSlot(children, 'reactions'),
	}

	if (slots.actions) {
		if (!isValidElement(slots.actions)) {
			throw new Error('Element with slot name "actions" should be a valid DiscordButtons component.')
		}

		slots.default = elementsWithoutSlot(slots.default, 'actions')
	}

	if (slots.embeds) {
		if (!isValidElement(slots.embeds)) {
			throw new Error('Element with slot name "embeds" should be a valid DiscordEmbed component.')
		}

		slots.default = elementsWithoutSlot(slots.default, 'embeds')
	}

	if (slots.interactions) {
		if (!isValidElement(slots.interactions)) {
			throw new Error('Element with slot name "interactions" should be a valid DiscordInteraction component.')
		}

		slots.default = elementsWithoutSlot(slots.default, 'interactions')
	}

	if (slots.reactions) {
		if (!isValidElement(slots.reactions)) {
			throw new Error('Element with slot name "reactions" should be a valid DiscordEmbed component.')
		}

		slots.default = elementsWithoutSlot(slots.default, 'reactions')
	}

	const ephemeralMessage = (slots?.interactions as ReactElement)?.props?.ephemeral

	const highlightMessage = (slots?.default as ReactElement[])
		?.some?.(({ props = {} }) => props?.highlight && props?.type !== 'channel')
		|| (slots?.interactions as ReactElement)?.props?.highlight

	let messageClasses = 'discord-message'
	if (ephemeralMessage) messageClasses += ' discord-ephemeral-highlight'
	if (highlightMessage && !ephemeralMessage) messageClasses += ' discord-mention-highlight'

	const emoji_regex = /^(?:[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]|\s)*$/ug

	return (
		<MaybeTwemoji useTwemoji={useTwemoji} jumboable={emoji_regex.test(
			(slots.default ? slots.default : '').toString(),
		)}>
			<div className={messageClasses}>
				{slots.interactions}
				<div className="discord-message-content">
					<div className="discord-author-avatar">
						<img src={user.avatar} alt="" />
					</div>
					<div className="discord-message-body">
						{!compactMode
							? <div>
								<AuthorInfo author={user.author} bot={user.bot} roleColor={user.roleColor} />
								<span className="discord-message-timestamp">
									{messageTimestamp}
								</span>
							</div>
							: <Fragment>
								<span className="discord-message-timestamp">
									{messageTimestamp}
								</span>
								<AuthorInfo author={user.author} bot={user.bot} roleColor={user.roleColor} />
							</Fragment>
						}
						{slots.default}
						{edited && <span className="discord-message-edited">(edited)</span>}
						{slots.embeds}
						{slots.actions}
						{ephemeralMessage && <div className="discord-message-ephemeral-notice">
							Only you can see this
						</div>}
						{slots.reactions}
					</div>
				</div>
			</div>
		</MaybeTwemoji>
	)
}
