import { useTranslation } from 'react-i18next';
import React from 'react';
import { observer } from 'mobx-react-lite';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ValueDisplayer, IPropertyDisplayerProps, IPropertySectionDisplayerProps } from '@components/common';
import { ATTRIBUTE_FIELDS, SKILL_FIELDS, IPerson } from '@state/common';
import { floatFormatter } from '@helpers/formatters';

interface ICrewMemberParametersProps {
  person: IPerson;
}

const PropertyDisplayer = observer((props: IPropertyDisplayerProps) => {
  const {
    sectionKey,
    property: paramKey,
    getValue,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <Grid item xs={6}>
        <Typography>
          {t(`${sectionKey}.${paramKey}`, { ns: 'common' })}
        </Typography>
      </Grid>
      <Grid item xs={6} sx={{ textAlign: "right" }}>
        <b>{<ValueDisplayer getValue={getValue} />}</b>
      </Grid>
    </>
  );
});

const PropertySectionDisplayer = observer((props: IPropertySectionDisplayerProps) => {
  const {
    sectionKey,
    properties,
  } = props;
  const { t } = useTranslation();

  return (
    <Grid item xs={12} sm={6}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h6">
            {t(`sections.${sectionKey}`, { ns: 'common' })}
          </Typography>
        </Grid>

        {properties.map(({ property, getValue }) => (
          <PropertyDisplayer
            key={property}
            sectionKey={sectionKey}
            property={property}
            getValue={getValue}
          />
        ))}
      </Grid>
    </Grid>
  );
});

const CrewMemberParameters = observer((props: ICrewMemberParametersProps) => {
  const {
    person,
  } = props;
  const { t } = useTranslation();

  const handleChangeAccordion  = React.useCallback(() => {
    person.toggleParameters();
  }, [person]);

  return (
    <Accordion expanded={person.sectionsOpened.parameters} onChange={handleChangeAccordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h5">
          {t('sections.parameters', { ns: 'common' })}
        </Typography>
      </AccordionSummary>
    
      <AccordionDetails>
        <Grid container columnSpacing={4} rowGap={1}>
          <PropertySectionDisplayer
            sectionKey="attributes"
            properties={ATTRIBUTE_FIELDS.map(field => ({
              property: field,
              getValue: () => floatFormatter.format(person.attributes[field]),
            }))}
          />

          <PropertySectionDisplayer
            sectionKey="skills"
            properties={SKILL_FIELDS.map(field => ({
              property: field,
              getValue: () => floatFormatter.format(person.skills[field]),
            }))}
          />
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
});

export default CrewMemberParameters;
