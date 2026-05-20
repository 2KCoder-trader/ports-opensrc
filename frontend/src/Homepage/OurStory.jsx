import styles from './OurStory.module.css';
import John from './Images/john_headshot.jpg'
import Advaith from './Images/advaith_headshot.jpg'
import Kaiden from './Images/kaiden_headshot.jpg'

export default function OurStory() {
  return (
    <section className={styles.story}>
      <div className={styles.storyContainer}>
        <h1 className={styles.storyTitle}>Our Story</h1>
        
        <div className={styles.storyContent}>
          The story of Ports starts at Purdue, where John and Kaiden met at a run club. They participated in a datathon, where they met Advaith, and the three of them went on to win it together. Over the next year, they began working together on an algo fund, trading in sim at first and raising enough to live trade and understand market complexities. When talking to friends and family about what they were working on, they realized there was a large discrepancy in market knowledge, and wanted to find a way to connect experienced individuals with newcomers in one integrated solution. Working with both leaders in the industry, as well as students and investors, they developed a solution that is simple but powerful and tackles this difficult challenge.
        </div>

        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <img src={John} alt="" className={styles.memberImage} />
            <h2 className={styles.memberName}>John Reilly</h2>
            <p className={styles.memberBio}>
              A senior at NYU studying mathematics and economics, with a minor in business. On the side, he enjoys beekeeping and photography.
            </p>
          </div>

          <div className={styles.teamMember}>
            <img src={Advaith} alt="" className={styles.memberImage} />
            <h2 className={styles.memberName}>Advaith Hari</h2>
            <p className={styles.memberBio}>
              A senior at Purdue studying Computer Science and Data Science in the Honors College. He loves playing classic video games in his free time.
            </p>
          </div>

          <div className={styles.teamMember}>
            <img src={Kaiden} alt="" className={styles.memberImage} />
            <h2 className={styles.memberName}>Kaiden Krenek</h2>
            <p className={styles.memberBio}>
              A senior at Purdue majoring in data science, with a minor in finance. He loves to run in his free time and has two cats.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
