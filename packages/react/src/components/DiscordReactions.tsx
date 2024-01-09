import React, { ReactElement } from 'react'
import { PropsWithSlot } from '../util'
import '@pycord/discord-message-components-core/dist/styles/discord-reactions.css'

export default function DiscordReactions({ children }: PropsWithSlot): ReactElement {
	return (
		<div className="discord-reactions">
			{children}
		</div>
	)
}
