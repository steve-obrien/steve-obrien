<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import { ElCalendar } from '../../lib/vue';

import BookingDate from './examples/BookingDate.vue';
import BookingDateSrc from './examples/BookingDate.vue?raw';

const doc = ElCalendar.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElCalendar"
					:initial="{
						label: 'Booking date',
						description: 'Pick a date for the booking.',
						modelValue: '2026-06-18',
						initialMonth: 6,
						initialYear: 2026,
						min: '2026-01-01',
						max: '2026-12-31',
					}"
					title="Calendar playground"
					description="Use the controls to move by month or year, then select a day in the grid."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Month date picker">
				<Example
					:source="BookingDateSrc"
					filename="BookingDate.vue"
					description="The calendar emits a simple YYYY-MM-DD value that can be stored in a form or sent to an API."
				>
					<BookingDate />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElCalendar" />
			</DocSection>

			<ComponentEvents :component="ElCalendar" />
		</DocPage>
	</ElementsLayout>
</template>
