<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import ComponentKeyboard from '../../_layout/docs/ComponentKeyboard.vue';
import { ElDatePicker } from '../../lib/vue';

import BookingDate from './examples/BookingDate.vue';
import BookingDateSrc from './examples/BookingDate.vue?raw';
import UsDateFormat from './examples/UsDateFormat.vue';
import UsDateFormatSrc from './examples/UsDateFormat.vue?raw';

const doc = ElDatePicker.__doc;
</script>

<template>
	<ElementsLayout>
		<DocPage :name="doc.name" :tagline="doc.description" :tag="doc.tag">
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElDatePicker"
					:initial="{
						label: 'Appointment date',
						description: 'Type dd/mm/yyyy or pick from the calendar.',
						modelValue: '2026-06-18',
						dateFormat: 'dd/mm/yyyy',
						calendarProps: { min: '2026-01-01', max: '2026-12-31' },
						popoverProps: { position: 'bottom-end' },
					}"
					title="Date picker playground"
					description="The text box stores a YYYY-MM-DD value. Pass calendarProps and popoverProps to configure the composed calendar and popover."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="UK date format">
				<Example
					:source="BookingDateSrc"
					filename="BookingDate.vue"
					description="Use dd/mm/yyyy for typed dates while storing the value as YYYY-MM-DD."
				>
					<BookingDate />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="US date format">
				<Example
					:source="UsDateFormatSrc"
					filename="UsDateFormat.vue"
					description="Switch to mm/dd/yyyy and en-US calendar labels for US-facing forms."
				>
					<UsDateFormat />
				</Example>
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElDatePicker" />
				<ComponentEvents :component="ElDatePicker" />
				<ComponentKeyboard :component="ElDatePicker" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
