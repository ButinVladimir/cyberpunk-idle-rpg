import { useTranslation } from 'react-i18next';
import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import pick from 'lodash/pick';
import { v4 as uuid } from 'uuid';
import { IAttributes, ISkills, IPerson, Person } from '@state/common';
import { getGameStateManagerInstance } from '@state/gameStateManager';
import { crewEditorCallbacksContext } from '../../crewEditorCallbacksContext';
import { IGeneralState } from './types';
import NameInput from './NameInput';
import GeneralInputs from './GeneralInputs';
import AttributeInputs from './AttributeInputs';
import SkillInputs from './SkillInputs';

interface ICrewMemberEditorProps {
  action: 'create' | 'edit';
  person?: IPerson;
}

export default function CrewMemberEditor(props: ICrewMemberEditorProps) {
  const {
    action,
    person,
  } = props;
  const gameStateManager = getGameStateManagerInstance();
  const { listMembers } = React.useContext(crewEditorCallbacksContext);
  const { t } = useTranslation();

  const [generalState, setGeneralState] = React.useState<IGeneralState>(() => {
    if (!person) {
      return {
        name: '',
        level: 0,
        exp: 0,
        hpRatio: 0,
        loyalty: 0,
        attributePoints: 0,
        skillPoints: 0,
      };
    }

    return pick(person, ['name', 'level', 'exp', 'hpRatio', 'loyalty', 'attributePoints', 'skillPoints']);
  });

  const [attributesState, setAttributesState] = React.useState<IAttributes>(() => {
    if (!person) {
      return {
        strength: 0,
        endurance: 0,
        agility: 0,
        perception: 0,
        intellect: 0,
        charisma: 0,
      };
    }

    return { ...person.attributes };
  });

  const [skillsState, setSkillsState] = React.useState<ISkills>(() => {
    if (!person) {
      return {
        closeCombat: 0,
        rangedCombat: 0,
        stealth: 0,
        infoGathering: 0,
        persuasion: 0,
        hacking: 0,
        engineering: 0,
        chemistry: 0,
      };
    }

    return { ...person.skills };
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const newPerson = new Person(
      person ? person.id : uuid()
    );

    Object.assign(newPerson, generalState);
    Object.assign(newPerson.attributes, attributesState);
    Object.assign(newPerson.skills, skillsState);

    if (person) {
      gameStateManager.crewState.updateCrewMember(person.id, newPerson);
    } else {
      gameStateManager.crewState.addCrewMember(newPerson);
    }

    listMembers();
  };

  const titleKey = action === 'create' ? 'creatingCrewMember' : 'editingCrewMember';
  const submitButtonTextKey = action === 'create' ? 'create' : 'update';

  return (
    <form
      id="edit-crew-member-form"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Grid container rowGap={2} columnSpacing={2}>
        <Grid item xs={12}>
          <Typography variant="h3">
            {t(`crewEditor.${titleKey}`, { ns: 'ui'})}
          </Typography>
        </Grid>

        <NameInput
          generalState={generalState}
          setGeneralState={setGeneralState}
        />

        <GeneralInputs
          generalState={generalState}
          setGeneralState={setGeneralState}
        />

        <AttributeInputs
          attributesState={attributesState}
          setAttributesState={setAttributesState}
        />

        <SkillInputs
          skillsState={skillsState}
          setSkillsState={setSkillsState}
        />

        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <ButtonGroup disableElevation>
            <Button
              type="button"
              variant="outlined"
              onClick={listMembers}
            >
              {t('common.cancel', { ns: 'ui'})}
            </Button>

            <Button
              type="submit"
              variant="contained"
            >
              {t(`common.${submitButtonTextKey}`, { ns: 'ui'})}
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    </form>
  );
}
