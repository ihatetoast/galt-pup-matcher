import type { Dog } from '../types';
import { dogAgeCategory } from '../utils/scoring';
import Tag from './Tag';
import styles from './DogProfile.module.css';

interface Props {
  dog: Dog;
}

export default function DogProfile({ dog }: Props) {
  return (
    <div className={styles.hero}>
      <div className={styles.icon}>{dog.emoji}</div>
      <div style={{ flex: 1 }}>
        <div className={styles.name}>{dog.name}</div>
        <div className={styles.sub}>
          📍 {dog.location} &nbsp;·&nbsp; Foster: {dog.foster}
          {dog.coordinator && <>&nbsp;·&nbsp; AC: {dog.coordinator}</>}
        </div>

        <div className={styles.tags}>
          {dog.sex === 'F' && <Tag type='neutral'>♀ Female</Tag>}
          {dog.sex === 'M' && <Tag type='neutral'>♂ Male</Tag>}
          {dog.age != null && (
            <Tag type='neutral'>
              {dog.age} yr · {dogAgeCategory(dog.age)[0]}
            </Tag>
          )}
          {dog.only === 'no'  && <Tag type='yes'>Needs Dog Companion</Tag>}
          {dog.only === 'yes' && <Tag type='neutral'>Can Be Only Dog</Tag>}
          {dog.cats === true  && <Tag type='yes'>Cats OK</Tag>}
          {dog.cats === false && <Tag type='no'>No Cats</Tag>}
          {dog.cats === null  && <Tag type='neutral'>Cats Unknown</Tag>}
          {dog.apt === false  && <Tag type='no'>House Only</Tag>}
          {dog.apt === true   && <Tag type='yes'>Apt OK</Tag>}
          {dog.apt === null   && <Tag type='neutral'>Apt Unknown</Tag>}
          {dog.smallDogs === true  && <Tag type='yes'>Small Dogs OK</Tag>}
          {dog.smallDogs === false && <Tag type='no'>No Small Dogs</Tag>}
          {dog.smallDogs === null  && <Tag type='neutral'>Small Dogs Unknown</Tag>}
          {dog.stairs === true  && <Tag type='yes'>Stairs OK</Tag>}
          {dog.stairs === false && <Tag type='no'>No Stairs</Tag>}
          {dog.experiencedOnly  && <Tag type='maybe'>Experienced Adopter Only</Tag>}
          {dog.needsLessTimeAway && <Tag type='maybe'>Needs Someone Home</Tag>}
        </div>

        {dog.notes && <div className={styles.note}>"{dog.notes}"</div>}
      </div>
    </div>
  );
}