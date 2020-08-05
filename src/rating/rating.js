/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
/* eslint-disable one-var */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import MaterialRating from '@material-ui/lab/Rating';
import classNames from 'classnames';
import Loading from '../loading/loading';
import { TextField } from '@material-ui/core';

import './sass/rating.scss';

/**
 * custom star svg as thje m,aterial ones had too thick stroke
 */
const Star = (props) => {
    return (
        <svg width='100%' height='100%' viewBox='0 0 21 20' >
            <path
                d='M18.7801293,8.27466498 L12.8268001,7.76130418 L10.5003474,2.28047975 L8.17320044,7.77122151 L2.22308341,8.27602977 L6.74248862,12.1911922 L5.38513229,18.0096159 L10.5,14.922487 L15.6167758,18.0107676 L14.267429,12.1911921 L18.7801293,8.27466498 Z'
                stroke={props.stroke ? props.stroke : '#fff'}
                strokeWidth='0.75px'
                fill={props.fill ? props.fill : 'none'}
            />
        </svg>
    );
};

class Rating extends Component {
    constructor(props) {
        super(props);

        // Page name allows us to store a reference to the page without relying on a page relation
        this.page = props.page;
        this.page['name'] = this.page.name || 'unknown';

        this.form = props.form;

        // check if this page has been previously rated by looking
        // for thje cookie with the pageName
        const rating = props.value || 0,
            previouslyRated = rating > 0;

        this.state = {
            value: rating,
            submitted: this.form.submitted,
            expanded: this.form.comments.expanded,
            previouslyRated: previouslyRated
        };
    }

    /**
     * Expand out the comments area
     */
    setExpand(e) {
        e.preventDefault();
        this.setState({ expanded: !this.state.expanded });
    }

    /**
     * Render title
     */
    renderTitle() {
        return <h3
            className='rating__title'
        >
            {this.form.title || 'Rate this page'}
        </h3>;
    }

    /**
     * Render comments area
     * - only if enabled in bootData
     */
    renderComments(disabled, submitted) {
        const commentsClasses = classNames({
            'rating__comments': true,
            'rating__comments--expanded': this.state.expanded
        }), { errors } = this.props;

        return this.form.comments.enabled && (
            <div className='rating__comments-outer'>
                <button
                    className='rating__comments-toggle'
                    onClick={e => this.setExpand(e)}
                    aria-controls='ratingcomments'
                    aria-expanded={this.state.expanded}
                    id='rating_commnets_expand'
                    disabled={disabled || submitted}
                >
                    Add a comment
                </button>
                <div
                    className={commentsClasses}
                    id='ratingcomments'
                    aria-hidden={!this.state.expanded}
                    aria-expanded={this.state.expanded}
                >
                    <div className='rating__comments-field'>
                        <label
                            className='sr-only'
                            htmlFor={
                                this.props.CommentsID
                            }
                        >
                            Additional comments
                        </label>
                        <textarea
                            rows={5}
                            readOnly={submitted}
                            disabled={disabled || submitted}
                            {...this.form.comments.props}
                        />
                        {errors['comments'] && (
                            <p className='rating__error'>{errors['comments']}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Render stars
     */
    renderStars(disabled) {
        const { errors, value } = this.props;

        return <div className='rating__stars'>
            <MaterialRating
                name={`rating-${this.props.name}`}
                emptyIcon={<Star stroke='#fff' />}
                icon={<Star stroke='#fff' fill='#fff' />}
                value={parseInt(this.state.value, 10)}
                onChange={(event, newValue) => {
                    this.props.setRatingValue(newValue);
                    this.setState({ value: newValue });
                }}
                disabled={disabled || this.form.submitted}
            />
            {errors['rating'] && (
                <p className='rating__error'>Please select a rating</p>
            )}
        </div>;
    }

    /**
     * Render Submit button
     */
    renderSubmit(disabled) {
        return <>
            <input
                type='hidden'
                name='pageName'
                value={this.page.name}
            />
            <input
                type='hidden'
                name='pageID'
                value={this.page.id}
            />
            <button
                id='rating_submit'
                type='submit'
                className='button button--primary button--small button--cta button--rating rating__action'
                aria-disabled={disabled}
                disabled={disabled}
                onClick={(e) => {
                    const submitted = this.props.onSubmit(e);
                    submitted && this.setState({ submitted: true });
                }}
            >
                Submit
            </button>
        </>;
    }

    renderIntro(loading, submitted) {
        return (
            loading ? (
                <div className='rating__loading'>
                    <Loading id='rating-loading' showImmediately />
                </div>
            ) : submitted ? (
                // has just been submitted - show success message
                <>
                    {this.form.successMessage ? (
                        <div
                            className='rating__result'
                            dangerouslySetInnerHTML={{
                                __html: this.form.successMessage
                            }}
                        />
                    ) : (
                            <div className='rating__result'>
                                <p>Thank you for your submission</p>
                            </div>
                        )}
                </>
            ) : this.state.previouslyRated ? (
                // rated in a previous session - dont show any message
                <div />
            ) : this.form.intro ? (
                // intro
                <div
                    className='rating__into'
                    dangerouslySetInnerHTML={{
                        __html: this.form.intro
                    }}
                />
            ) : <div />
        );
    }

    /**
     * States:
     * Ratings disabled (via CMS / bootata) - render empty div
     * Previously Submitted (from cookie) - show title and stars only. Dont show comments
     *      as that could be a security concern
     * Loading - show disaabled form with a spinner
     * Submitted - user has just submitted a rating - show success and disabled form
     * Error - Error from the graphql backend. Only show errors message.
     */
    render() {
        const { enabled, onSubmit } = this.props;

        if (!enabled) {
            return <div data-rating-disabled />;
        }

        const { name, errors, loading } = this.props,
            disabled = this.state.previouslyRated || loading || this.form.submitted,
            classes = classNames({
                'rating': true,
                'rating--disabled': disabled,
                'rating--expanded': this.state.expanded
            });

        return (
            <div className={classes} data-rating-enabled data-rating-name={name}>

                {errors && errors.response ? (
                    // errors returned from graphql. dont render anything else
                    <div className='rating__message'>
                        <p>An errors occurred<br />Please try again later</p>
                    </div>
                ) : (
                        <form
                            className='rating__form'
                        >
                            {this.renderTitle()}
                            {this.renderIntro(loading, this.form.submitted)}
                            {this.renderStars(disabled)}

                            {!this.state.previouslyRated && (
                                <>
                                    {this.renderComments(disabled, this.form.submitted)}
                                    {this.renderSubmit(disabled)}
                                </>
                            )}
                        </form>
                    )}
            </div>
        );
    }
}

export default Rating;