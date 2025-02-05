/**
 * External dependencies
 */
import {
	addBlock,
	fireEvent,
	getEditorHtml,
	initializeEditor,
	within,
	getBlock,
	waitFor,
} from 'test/helpers';

/**
 * WordPress dependencies
 */
import { getBlockTypes, unregisterBlockType } from '@wordpress/blocks';
import { registerCoreBlocks } from '@wordpress/block-library';

beforeAll( () => {
	// Register all core blocks
	registerCoreBlocks();
} );

afterAll( () => {
	// Clean up registered blocks
	getBlockTypes().forEach( ( block ) => {
		unregisterBlockType( block.name );
	} );
} );

describe( 'Social links block', () => {
	it( 'inserts block with the default icons and the WordPress link set as active', async () => {
		const screen = await initializeEditor();

		// Add block
		await addBlock( screen, 'Social Icons' );

		// Get block
		const socialLinksBlock = await getBlock( screen, 'Social Icons' );

		// Trigger inner blocks layout
		const innerBlockListWrapper = await waitFor( () =>
			within( socialLinksBlock ).getByTestId( 'block-list-wrapper' )
		);
		fireEvent( innerBlockListWrapper, 'layout', {
			nativeEvent: {
				layout: {
					width: 300,
				},
			},
		} );

		// Check the WordPress icon has a URL set (active)
		const firstLinkBlock = await getBlock( screen, 'Social Icon' );
		fireEvent.press( firstLinkBlock );
		const firstLink = within( socialLinksBlock ).getByAccessibilityHint(
			/WordPress has URL set/
		);
		expect( firstLink ).toBeVisible();

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'shows active links correctly when not selected', async () => {
		const screen = await initializeEditor();

		// Add Social Icons block
		await addBlock( screen, 'Social Icons' );

		// Get block
		const socialLinksBlock = await getBlock( screen, 'Social Icons' );

		// Trigger inner blocks layout
		const innerBlockListWrapper = await waitFor( () =>
			within( socialLinksBlock ).getByTestId( 'block-list-wrapper' )
		);
		fireEvent( innerBlockListWrapper, 'layout', {
			nativeEvent: {
				layout: {
					width: 300,
				},
			},
		} );

		// Add Paragraph block
		await addBlock( screen, 'Paragraph' );

		// Check there's only one active social link
		const socialLinks =
			within( socialLinksBlock ).getAllByA11yLabel( / social icon/ );
		expect( socialLinks.length ).toBe( 1 );

		// Check the WordPress link is shown when unselected
		const firstLinkBlock = await getBlock( screen, 'Social Icon' );
		fireEvent.press( firstLinkBlock );
		const firstLink = within( socialLinksBlock ).getByAccessibilityHint(
			/WordPress has URL set/
		);
		expect( firstLink ).toBeVisible();

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'shows the social links bottom sheet when tapping on the inline appender', async () => {
		const screen = await initializeEditor();
		const { getByTestId, getByText } = screen;

		// Add block
		await addBlock( screen, 'Social Icons' );

		// Get block
		const socialLinksBlock = await getBlock( screen, 'Social Icons' );
		fireEvent.press( socialLinksBlock );

		// Trigger inner blocks layout
		const innerBlockListWrapper = await waitFor( () =>
			within( socialLinksBlock ).getByTestId( 'block-list-wrapper' )
		);
		fireEvent( innerBlockListWrapper, 'layout', {
			nativeEvent: {
				layout: {
					width: 300,
				},
			},
		} );

		// Open the links bottom sheet
		const appenderButton =
			within( socialLinksBlock ).getByTestId( 'appender-button' );
		fireEvent.press( appenderButton );

		// Find a social link in the inserter
		const blockList = getByTestId( 'InserterUI-Blocks' );

		// onScroll event used to force the FlatList to render all items
		fireEvent.scroll( blockList, {
			nativeEvent: {
				contentOffset: { y: 0, x: 0 },
				contentSize: { width: 100, height: 100 },
				layoutMeasurement: { width: 100, height: 100 },
			},
		} );

		// Add the Amazon link
		const amazonBlock = await waitFor( () => getByText( 'Amazon' ) );
		expect( amazonBlock ).toBeVisible();

		fireEvent.press( amazonBlock );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );

	it( 'shows the ghost placeholder when no icon is active', async () => {
		const screen = await initializeEditor();
		const { getByA11yLabel } = screen;

		// Add block
		await addBlock( screen, 'Social Icons' );

		// Get block
		const socialLinksBlock = await getBlock( screen, 'Social Icons' );

		// Trigger inner blocks layout
		const innerBlockListWrapper = await waitFor( () =>
			within( socialLinksBlock ).getByTestId( 'block-list-wrapper' )
		);
		fireEvent( innerBlockListWrapper, 'layout', {
			nativeEvent: {
				layout: {
					width: 300,
				},
			},
		} );

		// Get the first social link
		const firstLinkBlock = await getBlock( screen, 'Social Icon' );
		fireEvent.press( firstLinkBlock );

		// Open block actions menu
		const blockActionsButton = getByA11yLabel( /Open Block Actions Menu/ );
		fireEvent.press( blockActionsButton );

		// Delete the social link
		const deleteButton = getByA11yLabel( /Remove block/ );
		fireEvent.press( deleteButton );

		// Add Paragraph block
		await addBlock( screen, 'Paragraph' );

		// Check the ghost placeholders are visible
		const socialLinks = within( socialLinksBlock ).getAllByTestId(
			'social-links-placeholder'
		);
		expect( socialLinks.length ).toBe( 3 );

		expect( getEditorHtml() ).toMatchSnapshot();
	} );
} );
