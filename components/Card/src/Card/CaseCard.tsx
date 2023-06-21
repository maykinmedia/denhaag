import React from 'react';
import { ArrowRightIcon } from '@gemeente-denhaag/icons';
import { Paragraph } from '@gemeente-denhaag/typography';
import clsx from 'clsx';
import './card.scss';
import Card from './Card';
import CardBackground from './CardBackground';
import CardActions from './CardActions';
import CardContent from './CardContent';
import CardTextWrapper from './CardTextWrapper';
import CardWrapper from './CardWrapper';
import CardDateWrapper from './CardDateWrapper';
import CardDate from './CardDate';
import CardAction from './CardAction';

export interface CaseCardProps {
  /**
   * Determines the title of the card
   */
  title: string;

  /**
   * Determines the subtitle of the card
   */
  subTitle?: string;

  /**
   * Determines the date shown on the card
   */
  date?: Date;

  /**
   * Determines the url the card points to
   */
  href?: string;

  /**
   * Determines the card color
   */
  active?: boolean;
}

/**
 * Primary UI component for user interaction
 */
export const CaseCard: React.FC<CaseCardProps> = ({ title, subTitle, date, href, active = true }: CaseCardProps) => {
  const classNames = clsx('denhaag-case-card', !active && 'denhaag-case-card--archived');

  return (
    <Card className={classNames}>
      <CardWrapper>
        <CardBackground />
        <CardContent>
          <CardTextWrapper>
            <Paragraph className="denhaag-card__title">{title}</Paragraph>
            <Paragraph className="denhaag-card__subtitle">{subTitle}</Paragraph>
          </CardTextWrapper>
          <CardActions>
            {date && (
              <CardDateWrapper>
                <CardDate dateTime={date.toISOString()}>{date.toLocaleDateString()}</CardDate>
              </CardDateWrapper>
            )}
            <CardAction href={href}>
              <ArrowRightIcon className="denhaag-card__arrow-icon" />
            </CardAction>
          </CardActions>
        </CardContent>
      </CardWrapper>
    </Card>
  );
};

/**
 * Default export for Card
 */
export default CaseCard;
