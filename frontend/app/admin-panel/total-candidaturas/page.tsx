'use client';

import Candidatures from './candidatures/page';
import Sponstaneous from './spontaneous/page';

export default function TotalCandidaturas() {

	return (
		<div className="space-y-8">
			<Sponstaneous/>
			<Candidatures/>
		</div>
	);
}
