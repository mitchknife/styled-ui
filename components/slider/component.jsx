import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import memoize from 'memoize-one';
import { Box } from '../Box';
import { PopoverManager, PopoverReference, Popover } from '../popover';
import * as Styled from './styled';

function range(from, to) {
	return [...Array(to - from).keys()].map(num => num + from);
}

// Derived from https://github.com/Faithlife/react-util/
function createDerivedValue(getDependencies, calculateValue) {
	const calculateMemoizedValue = memoize(calculateValue);
	return () => calculateMemoizedValue(...getDependencies());
}

export class Slider extends PureComponent {
	static propTypes = {
		disabled: PropTypes.bool,
		value: PropTypes.number.isRequired,
		/** Array of numbers or strings to be used as tooltip labels */
		labels: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
		/** 0-based index */
		minValue: PropTypes.number,
		/** 0-based index, should be less than stopCount if specified */
		maxValue: PropTypes.number,
		/** Triggered every time the slider moves */
		onSlide: PropTypes.func,
		/** Triggered when the slider stops moving */
		onStop: PropTypes.func,
		stopCount: PropTypes.number.isRequired,
		/** Useful for sliders with many stops */
		hideAvailableStops: PropTypes.bool,
		/** Style overrides */
		styleOverrides: PropTypes.shape({
			backgroundColor: PropTypes.string,
		}),
	};

	static defaultProps = {
		hideAvailableStops: false,
		labels: [],
		styleOverrides: {},
	};

	state = {
		value: this.props.value,
		isHovered: false,
		isSliding: false,
	};

	_slider = createRef();
	_timeout = null;

	componentWillReceiveProps(nextProps) {
		if (nextProps.value !== this.state.value) {
			this.setState({ value: nextProps.value });
		}
	}

	componentWillUnmount() {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
	}

	calculateValue = clientX => {
		if (!(this._slider && this._slider.current)) {
			return null;
		}

		const rect = this._slider.current.getBoundingClientRect();
		const width = rect.right - rect.left;
		const pos = clientX - rect.left;
		const clampedX = Math.min(Math.max(0, pos), width);

		const newValue = Math.round((clampedX / width) * (this.props.stopCount - 1));
		const { minValue, maxValue } = this.props;
		return newValue > maxValue ? maxValue : newValue < minValue ? minValue : newValue;
	};

	getStops = createDerivedValue(() => [this.props.stopCount], stopCount => range(0, stopCount));
	getTrack = createDerivedValue(() => [this.props.stopCount], stopCount => range(0, stopCount - 1));

	handleTouchStart = event => {
		if (this.props.disabled) {
			return;
		}

		event.preventDefault();
		document.addEventListener('touchmove', this.handleTouchMove);
		document.addEventListener('touchend', this.handleTouchEnd);
		this.setState({ isHovered: true, isSliding: true });
		this.handleTouchMove(event);
	};

	handleTouchMove = event => {
		if (this.props.disabled) {
			return;
		}

		event.preventDefault();
		const value = this.calculateValue(event.touches[0].clientX);
		if (this.state.value !== value) {
			if (this.props.onSlide) {
				this.props.onSlide(value);
			}
			this.setState({ value });
		}
	};

	handleTouchEnd = event => {
		if (this.props.disabled) {
			return;
		}

		event.preventDefault();
		document.removeEventListener('touchmove', this.handleTouchMove);
		document.removeEventListener('touchend', this.handleTouchEnd);

		if (this.props.onStop) {
			this.props.onStop(this.state.value);
		}

		this.setState({ isSliding: false });
		this.handleTogglePopover(false, 250);
	};

	handleMouseDown = event => {
		if (this.props.disabled) {
			return;
		}

		if (event.button !== 0 || this.state.isSliding) {
			return;
		}
		event.preventDefault();
		document.addEventListener('mousemove', this.handleMouseMove);
		document.addEventListener('mouseup', this.handleMouseUp);
		this.setState({ isHovered: true, isSliding: true });
		this.handleMouseMove(event);
	};

	handleMouseMove = event => {
		if (this.props.disabled) {
			return;
		}

		event.preventDefault();
		const value = this.calculateValue(event.clientX);
		if (this.state.value !== value) {
			if (this.props.onSlide) {
				this.props.onSlide(value);
			}
			this.setState({ value, isHovered: true });
		}
	};

	handleMouseUp = event => {
		if (this.props.disabled) {
			return;
		}

		event.preventDefault();
		document.removeEventListener('mousemove', this.handleMouseMove);
		document.removeEventListener('mouseup', this.handleMouseUp);

		if (this.props.onStop) {
			this.props.onStop(this.state.value);
		}

		this.setState({ isSliding: false });
		this.handleTogglePopover(false);
	};

	handleKeyDown = event => {
		if (event.key === 'Tab' || event.key === 'Escape') {
			return;
		}

		event.preventDefault();
		event.persist();
		this.handleThrottledKeyDown(event);
	};

	handleDebouncedKeyInput = debounce(() => {
		this.handleTogglePopover(false, 150);
		if (this.props.onStop) {
			this.props.onStop(this.state.value);
		}
	}, 250);

	handleThrottledKeyDown = throttle(event => {
		const { disabled, minValue, maxValue, stopCount } = this.props;
		const { value: currentValue } = this.state;

		if (disabled) {
			this.setState({ isHovered: true }, () => {
				this.handleTogglePopover(false, 400);
			});
			return;
		}

		if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
			const newValue = currentValue + 1;
			const value =
				newValue > maxValue ? maxValue : newValue > stopCount - 1 ? stopCount - 1 : newValue;
			return this.setState({ value, isHovered: true }, () => {
				this.handleDebouncedKeyInput();
				if (this.props.onSlide) {
					this.props.onSlide(value);
				}
			});
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
			const newValue = currentValue - 1;
			const value = newValue < minValue ? minValue : newValue < 0 ? 0 : newValue;
			return this.setState({ value, isHovered: true }, () => {
				this.handleDebouncedKeyInput();
				if (this.props.onSlide) {
					this.props.onSlide(value);
				}
			});
		}

		return false;
	}, 50);

	handleMouseEnter = event => {
		event.preventDefault();
		this.handleTogglePopover(true);
	};

	handleMouseLeave = event => {
		event.preventDefault();
		this.handleTogglePopover(false);
	};

	handleTogglePopover = (isOpen, delay = 0) => {
		if (!isOpen) {
			if (this._timeout) {
				clearTimeout(this._timeout);
			}
			this._timeout = setTimeout(() => {
				this.setState({ isHovered: false });
				this._timeout = null;
			}, delay || 0);
		} else {
			if (this._timeout) {
				clearTimeout(this._timeout);
			}
			this._timeout = setTimeout(() => {
				this.setState({ isHovered: true });
				this._timeout = null;
			}, delay || 0);
		}
	};

	render() {
		const {
			value,
			labels,
			minValue,
			maxValue,
			onSlide,
			onStop,
			stopCount,
			hideAvailableStops,
			styleOverrides,
			disabled,
			...props
		} = this.props;

		const { isHovered, isSliding, value: pendingValue } = this.state;
		const track = this.getTrack();
		const stops = this.getStops();

		const activeStopIndex = Math.min(Math.round(pendingValue), stopCount - 1);

		return (
			<Box
				onDragStart={event => event.preventDefault()}
				onKeyDown={this.handleKeyDown}
				onMouseDown={this.handleMouseDown}
				onTouchStart={this.handleTouchStart}
				tabIndex="0"
				ref={this._slider}
				position="relative"
				width="100%"
				minHeight="28px"
				css={`
					cursor: ${({ disabled }) => (disabled ? 'normal' : 'pointer')};
					touch-action: none;

					&:focus {
						box-shadow: 0 0 0 0.2rem rgba(30, 145, 214, 0.5);
						outline: none;
					}
				`}
				{...props}
			>
				<Styled.TrackContainer>
					<Styled.TrackGradient />
					{track.map(index => (
						<Styled.Track
							active={index < activeStopIndex}
							invalid={maxValue && index >= maxValue}
							trackFirst={index === 0}
							trackLast={index === maxValue - 1 || (!maxValue && index === stopCount - 2)}
							key={index}
							styleOverrides={styleOverrides}
						/>
					))}
				</Styled.TrackContainer>
				<Styled.StopContainer>
					{stops.map(index => (
						<Styled.Stop
							available={
								!hideAvailableStops &&
								(index > activeStopIndex && !(index >= maxValue) && !(index === stopCount - 1))
							}
							minimumAvailable={index === minValue && minValue > 0}
							key={index}
							styleOverrides={styleOverrides}
						/>
					))}
				</Styled.StopContainer>
				<Styled.ThumbContainer
					onMouseEnter={this.handleMouseEnter}
					onMouseLeave={this.handleMouseLeave}
				>
					{stops.map(index => (
						<Stop
							key={index}
							index={index}
							stopCount={stopCount}
							isSliding={isSliding}
							isHovered={isHovered}
							active={index === activeStopIndex}
							label={labels[index]}
							disabled={disabled}
							trackStart={index === 0}
							trackEnd={index === stopCount - 1}
						/>
					))}
				</Styled.ThumbContainer>
			</Box>
		);
	}
}

const Stop = React.memo(({ isSliding, isHovered, active, label, disabled, ...props }) => {
	const thumb = (
		<Styled.Thumb active={isSliding} hovered={isHovered} disabled={disabled} hidden={!active} />
	);

	const isPopupOpen = !!(active && isHovered && (label !== null && label !== undefined));
	return (
		<Styled.ThumbAnchor {...props}>
			{isPopupOpen ? (
				<PopoverManager>
					<PopoverReference>{thumb}</PopoverReference>
					<Popover
						isOpen
						placement={'top'}
						container="body"
						modifiers={{ offset: { offset: '0, 33' } }}
					>
						{`${label}`}
					</Popover>
				</PopoverManager>
			) : (
				thumb
			)}
		</Styled.ThumbAnchor>
	);
});
