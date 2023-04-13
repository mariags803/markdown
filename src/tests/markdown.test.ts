/*
"" -> ""
"text" -> "text"
"[text link](url)" -> "text link [^anchor1]\n\n[^anchor1]: url"
"irrelevant [text link](url)" -> "irrelevant text link [^anchor1]\n\n[^anchor1]: url"
"[text link](url) irrelevant" -> "text link [^anchor1] irrelevant\n\n[^anchor1]: url"
"irrelevant [text link](url) irrelevant" -> "irrelevant text link [^anchor1] irrelevant\n\n[^anchor1]: url"
"[text link](url) [text link2](url2)" -> "text link [^anchor1] text link2 [^anchor2]\n\n[^anchor1]: url\n\n[^anchor2]: url2"
"[text link](url) irrelevant [text link2](url)" -> "text link [^anchor1] irrelevant text link2 [^anchor1]\n\n[^anchor1]: url"
"[text link](url) (irrelevant) [text link2](url)" -> "text link [^anchor1] (irrelevant) text link2 [^anchor1]\n\n[^anchor1]: url"
 */

describe('MarkdownTransformer', () => {
	it('should handle empties', () => {
		expect(markdownTransformer('')).toBe('');
	});
	it('should not modify the text if it does not have links', () => {
		expect(markdownTransformer('text')).toBe('text');
	});
	it('should change a text link', () => {
		expect(markdownTransformer('[text link](url)')).toBe('text link [^anchor1]\n\n[^anchor1]: url');
	});
	it('should not modify the text before link', () => {
		expect(markdownTransformer('irrelevant [text link](url)')).toBe(
			'irrelevant text link [^anchor1]\n\n[^anchor1]: url'
		);
	});
	it('should not modify the text after link', () => {
		expect(markdownTransformer('[text link](url) irrelevant')).toBe(
			'text link [^anchor1] irrelevant\n\n[^anchor1]: url'
		);
	});
	it('should not modify the text before and after link', () => {
		expect(markdownTransformer('irrelevant [text link](url) irrelevant')).toBe(
			'irrelevant text link [^anchor1] irrelevant\n\n[^anchor1]: url'
		);
	});
	it('should change text links with different url', () => {
		expect(markdownTransformer('[text link](url) [text link2](url2)')).toBe(
			'text link [^anchor1] text link2 [^anchor2]\n\n[^anchor1]: url\n\n[^anchor2]: url2'
		);
	});
	it('should change text links with same url', () => {
		expect(markdownTransformer('[text link](url) irrelevant [text link2](url)')).toBe(
			'text link [^anchor1] irrelevant text link2 [^anchor1]\n\n[^anchor1]: url'
		);
	});
	it('should change only valid url', () => {
		expect(markdownTransformer('[text link](url) (irrelevant) [text link2](url)')).toBe(
			'text link [^anchor1] (irrelevant) text link2 [^anchor1]\n\n[^anchor1]: url'
		);
	});
});

let index = 1;
let anchors: { [key: string]: string } = {};
let footers: string[] = [];

function markdownTransformer(text: string): string {
	const linkExpression = /\[(.*?)\]\((.*?)\)/g;
	const links = text.match(linkExpression);
	if (!links) {
		return text;
	}
	const link = links[0];
	const linkText = getLinkText(link);
	const url = getUrl(link);
	let anchorTag = '';
	const anchor = Object.values(anchors).find((value: string) => value === url);
	if (!anchor) {
		anchorTag = '[^anchor' + index + ']';
		anchors[anchorTag] = url;
		footers.push('\n\n[^anchor' + index + ']: ' + url);
		index++;
	} else {
		anchorTag = Object.keys(anchors).find((key: string) => anchors[key] === url);
	}
	const textBeforeLink = text.substring(0, text.indexOf(link));
	const rawText = text.substring(text.indexOf(link) + link.length, text.length);
	const transformedText = textBeforeLink + linkText + ' ' + anchorTag + markdownTransformer(rawText);
	const footerText = footers.join('');
	index = 1;
	anchors = {};
	footers = [];
	return transformedText + footerText;
}

function getLinkText(text: string): string {
	const openingLinkTextTag = '[';
	const closingLinkTextTag = ']';
	return text.substring(text.indexOf(openingLinkTextTag) + 1, text.indexOf(closingLinkTextTag));
}

function getUrl(text: string) {
	const openingUrlTag = '(';
	const closingUrlTag = ')';
	return text.substring(text.indexOf(openingUrlTag) + 1, text.indexOf(closingUrlTag));
}
