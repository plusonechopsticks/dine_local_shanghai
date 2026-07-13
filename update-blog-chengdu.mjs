import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await conn.execute('SELECT id, content FROM blog_posts WHERE id = 4');
let content = rows[0].content;

// Insert the meetlocal@chengdu sentence after the Chengdu list item
// The list item ends with: </li>
// We insert a new sentence right after the Chengdu </li> entry
const chengduItem = '<li><strong>Chengdu:</strong> 3 nights. Pandas, Sichuan food, and Leshan Giant Buddha as a day trip.</li>';
const insertAfter = chengduItem;

// The sentence to add — as a new list item note or as a standalone paragraph after the list
// Per brief: "In the Chengdu/multi-city section, add: 'For Chengdu, our partner meetlocal@chengdu runs free walking tours that pair well with a home dining evening.'"
// Best placement: after the </ul> that ends the city list, as a new paragraph before the "fewer cities" paragraph
const ulClose = '</ul>\n\n<p>The travelers who enjoy China most';
const newContent = '</ul>\n\n<p>For Chengdu, our partner <a href="https://meetlocalchengdu.com/?utm_source=plus1chopsticks&utm_medium=blog&utm_campaign=chengdu_partner">meetlocal@chengdu</a> runs free walking tours that pair well with a home dining evening.</p>\n\n<p>The travelers who enjoy China most';

if (!content.includes(ulClose)) {
  console.error('Target string not found! Content may have changed.');
  process.exit(1);
}

const updatedContent = content.replace(ulClose, newContent);

// Verify the change
if (!updatedContent.includes('meetlocal@chengdu')) {
  console.error('Replacement failed!');
  process.exit(1);
}

await conn.execute('UPDATE blog_posts SET content = ? WHERE id = 4', [updatedContent]);
console.log('Blog post updated successfully.');
console.log('Verification: meetlocal@chengdu appears', (updatedContent.match(/meetlocal@chengdu/g) || []).length, 'time(s) in content.');

await conn.end();
